import { NextRequest, NextResponse } from "next/server";
import { createEvent, listEvents, type NewEvent } from "@/lib/events";

export async function GET() {
  const events = listEvents();
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
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

    const event = createEvent({
      name: body.name,
      canonicalName: body.canonicalName,
      renamedToName: body.renamedToName ?? null,
      description: body.description,
      tags: body.tags ?? [],
      productArea: body.productArea,
      source: body.source,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to create event" },
      { status: 500 },
    );
  }
}


