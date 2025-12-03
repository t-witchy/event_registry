import { NextRequest, NextResponse } from "next/server";
import { getEvent, updateEvent, type NewEvent } from "@/lib/events";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const numericId = Number(id);

  const event = getEvent(numericId);
  const event = getEvent(id);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const numericId = Number(id);

  const existing = getEvent(numericId);

  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  try {
    const body = (await req.json()) as Partial<NewEvent>;

    if (
      !body.name ||
      !body.canonicalName ||
      !body.description ||
      !body.productArea ||
      !body.source
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const updated = updateEvent(numericId, {
      name: body.name,
      canonicalName: body.canonicalName,
      renamedToName: body.renamedToName ?? null,
      description: body.description,
      tags: body.tags ?? [],
      productArea: body.productArea,
      source: body.source,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to update event" },
      { status: 500 },
    );
  }
}

