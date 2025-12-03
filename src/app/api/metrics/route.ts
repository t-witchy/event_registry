import { NextRequest, NextResponse } from "next/server";
import {
  createMetric,
  listMetrics,
  type EventPropertyFilterOperator,
  type EventPropertyFilter,
  type NewMetric,
  type Value,
} from "@/lib/metrics";

export async function GET() {
  const metrics = listMetrics();
  return NextResponse.json({ metrics });
}

type MetricRequestBody = {
  name?: string;
  description?: string;
  eventPropertyFilters?: EventPropertyFilter[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MetricRequestBody;

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

    const metricInput: NewMetric = {
      name: body.name,
      description: body.description,
      eventPropertyFilters: body.eventPropertyFilters,
    };

    const metric = createMetric(metricInput);
    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to create metric" },
      { status: 500 },
    );
  }
}


