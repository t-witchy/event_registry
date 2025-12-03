import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Platform, Prisma } from "@prisma/client";

function parseStringArray(param: string | string[] | null): string[] {
  if (!param) return [];
  if (Array.isArray(param)) return param;
  return param.split(",").map((v) => v.trim()).filter(Boolean);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") ?? "";
  const platformsParam = searchParams.getAll("platform");
  const groupIdParam = searchParams.get("groupId");
  const tagIdsParam = searchParams.get("tagId");
  const eventIdParam = searchParams.get("eventId");
  const view = searchParams.get("view") ?? "grouped";

  const platforms = platformsParam.length
    ? (platformsParam as Platform[])
    : [];
  const tagIds = parseStringArray(tagIdsParam).map((id) => Number(id)).filter(Number.isFinite);
  const groupId = groupIdParam ? Number(groupIdParam) : undefined;
  const eventId = eventIdParam ? Number(eventIdParam) : undefined;

  const where: Prisma.InterfaceWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      {
        interfaceGroup: {
          name: { contains: q, mode: "insensitive" },
        },
      },
      {
        tags: {
          some: {
            tag: {
              name: { contains: q, mode: "insensitive" },
            },
          },
        },
      },
    ];
  }

  if (platforms.length > 0) {
    where.platform = { in: platforms };
  }

  if (groupId) {
    where.interfaceGroupId = groupId;
  }

  if (tagIds.length > 0) {
    where.tags = {
      some: {
        tagId: {
          in: tagIds,
        },
      },
    };
  }

  if (eventId) {
    where.elements = {
      some: {
        events: {
          some: {
            eventId,
          },
        },
      },
    };
  }

  const interfaces = await prisma.interface.findMany({
    where,
    include: {
      interfaceGroup: true,
      tags: {
        include: {
          tag: true,
        },
      },
      elements: {
        include: {
          events: {
            include: {
              event: true,
            },
          },
        },
      },
      interfaceEvents: {
        include: {
          event: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const groups = await prisma.interfaceGroup.findMany({
    orderBy: { name: "asc" },
  });

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });

  const events = await prisma.event.findMany({
    orderBy: { displayName: "asc" },
  });

  const payload = interfaces.map((iface) => {
    const elementCount = iface.elements.length;
    const distinctEventIds = new Set<number>();

    iface.interfaceEvents.forEach((ie) => distinctEventIds.add(ie.eventId));

    iface.elements.forEach((el) =>
      el.events.forEach((e) => distinctEventIds.add(e.eventId)),
    );

    return {
      ...iface,
      elementCount,
      distinctEventCount: distinctEventIds.size,
      tags: iface.tags.map((it) => it.tag),
    };
  });

  return NextResponse.json({
    interfaces: payload,
    groups,
    tags,
    events,
    view,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      platform,
      figmaUrl,
      description,
      imageUrl,
      interfaceGroupId,
      tagIds,
      elements,
    } = body as {
      name?: string;
      platform?: Platform;
      figmaUrl?: string;
      description?: string;
      imageUrl?: string;
      interfaceGroupId?: number | null;
      tagIds?: number[];
      interfaceEvents?: Array<{
        canonicalName?: string;
        isPrimary?: boolean;
        notes?: string;
      }>;
      elements?: Array<{
        name?: string;
        description?: string;
        displayLabel?: string;
        position?: number;
        notes?: string;
        events?: Array<{
          canonicalName?: string;
          isPrimary?: boolean;
          notes?: string;
        }>;
      }>;
    };

    if (!name || !platform) {
      return NextResponse.json(
        { error: "name and platform are required" },
        { status: 400 },
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const iface = await tx.interface.create({
        data: {
          name,
          platform,
          figmaUrl,
          description,
          imageUrl,
          interfaceGroupId: interfaceGroupId ?? null,
        },
      });

      if (tagIds && tagIds.length > 0) {
        await tx.interfaceTag.createMany({
          data: tagIds.map((tagId: number) => ({
            interfaceId: iface.id,
            tagId,
          })),
          skipDuplicates: true,
        });
      }

      if (body.interfaceEvents && body.interfaceEvents.length > 0) {
        for (const ev of body.interfaceEvents) {
          if (!ev.canonicalName) continue;

          const eventRow = await tx.event.upsert({
            where: { canonicalName: ev.canonicalName },
            create: {
              canonicalName: ev.canonicalName,
              displayName: ev.canonicalName,
              source: "V2_STRONG",
            },
            update: {},
          });

          await tx.interfaceEvent.create({
            data: {
              interfaceId: iface.id,
              eventId: eventRow.id,
              isPrimary: ev.isPrimary ?? false,
              notes: ev.notes,
            },
          });
        }
      }

      if (elements && elements.length > 0) {
        for (const el of elements) {
          if (!el.name) continue;

          const element = await tx.element.create({
            data: {
              name: el.name,
              description: el.description,
            },
          });

          const interfaceElement = await tx.interfaceElement.create({
            data: {
              interfaceId: iface.id,
              elementId: element.id,
              displayLabel: el.displayLabel,
              position: el.position,
              notes: el.notes,
            },
          });

          if (el.events && el.events.length > 0) {
            for (const ev of el.events) {
              if (!ev.canonicalName) continue;

              const eventRow = await tx.event.upsert({
                where: { canonicalName: ev.canonicalName },
                create: {
                  canonicalName: ev.canonicalName,
                  displayName: ev.canonicalName,
                  source: "V2_STRONG",
                },
                update: {},
              });

              await tx.interfaceElementEvent.create({
                data: {
                  interfaceElementId: interfaceElement.id,
                  eventId: eventRow.id,
                  isPrimary: ev.isPrimary ?? false,
                  notes: ev.notes,
                },
              });
            }
          }
        }
      }

      return iface;
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to create interface" },
      { status: 500 },
    );
  }
}


