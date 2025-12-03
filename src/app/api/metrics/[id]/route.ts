import { NextRequest, NextResponse } from "next/server";
import { getMetric, updateMetric, type NewMetric } from "@/lib/metrics";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  const metric = getMetric(id);

  if (!metric) {
    return NextResponse.json({ error: "Metric not found" }, { status: 404 });
  }

  return NextResponse.json(metric);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  const existing = getMetric(id);

  if (!existing) {
    return NextResponse.json({ error: "Metric not found" }, { status: 404 });
  }

  try {
    const body = (await req.json()) as Partial<NewMetric>;

    if (
      !body.name ||
      !body.description ||
      !body.eventPropertyFilters ||
      body.eventPropertyFilters.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const hasInvalidFilter = body.eventPropertyFilters.some(
      (filter) =>
        !filter.eventPropertyName ||
        !filter.eventPropertyFilterOperator ||
        !filter.eventPropertyFilterValue,
    );

    if (hasInvalidFilter) {
      return NextResponse.json(
        { error: "Each filter must include name, operator, and value" },
        { status: 400 },
      );
    }

    const updated = updateMetric(id, {
      name: body.name,
      description: body.description,
      eventPropertyFilters: body.eventPropertyFilters,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to update metric" },
      { status: 500 },
    );
  }
}


