export type EventPropertyFilterOperator =
  | "EVENT_PROPERTY_FILTER_OPERATOR_UNSPECIFIED"
  | "EVENT_PROPERTY_FILTER_OPERATOR_EQUALS"
  | "EVENT_PROPERTY_FILTER_OPERATOR_NOT_EQUALS"
  | "EVENT_PROPERTY_FILTER_OPERATOR_LESS_THAN"
  | "EVENT_PROPERTY_FILTER_OPERATOR_LESS_THAN_OR_EQUAL"
  | "EVENT_PROPERTY_FILTER_OPERATOR_GREATER_THAN"
  | "EVENT_PROPERTY_FILTER_OPERATOR_GREATER_THAN_OR_EQUAL"
  | "EVENT_PROPERTY_FILTER_OPERATOR_CONTAINS"
  | "EVENT_PROPERTY_FILTER_OPERATOR_NOT_CONTAINS";

export type Value =
  | { kind: "null_value"; value: null }
  | { kind: "number_value"; value: number }
  | { kind: "string_value"; value: string }
  | { kind: "bool_value"; value: boolean }
  | { kind: "struct_value"; value: Record<string, Value> }
  | { kind: "list_value"; value: Value[] };

export type EventPropertyFilter = {
  eventPropertyName: string;
  eventPropertyFilterOperator: EventPropertyFilterOperator;
  eventPropertyFilterValue: Value;
};

export type Metric = {
  id: number;
  name: string;
  description: string;
  eventPropertyFilters: EventPropertyFilter[];
};

export type NewMetric = Omit<Metric, "id">;

let currentMetricId = 3;

const metrics: Metric[] = [
  {
    id: 1,
    name: "Games started per day",
    description:
      "Counts the number of game_started events emitted per calendar day.",
    eventPropertyFilters: [
      {
        eventPropertyName: "event.name",
        eventPropertyFilterOperator: "EVENT_PROPERTY_FILTER_OPERATOR_EQUALS",
        eventPropertyFilterValue: {
          kind: "string_value",
          value: "game_started",
        },
      },
    ],
  },
  {
    id: 2,
    name: "Abandoned game rate",
    description:
      "Share of games that emit a game_abandoned event compared to all games started.",
    eventPropertyFilters: [
      {
        eventPropertyName: "reason",
        eventPropertyFilterOperator:
          "EVENT_PROPERTY_FILTER_OPERATOR_NOT_EQUALS",
        eventPropertyFilterValue: {
          kind: "string_value",
          value: "user_resigned",
        },
      },
    ],
  },
];

export function listMetrics(): Metric[] {
  return metrics;
}

export function createMetric(input: NewMetric): Metric {
  const metric: Metric = {
    id: currentMetricId++,
    ...input,
  };

  metrics.push(metric);
  return metric;
}

export function getMetric(id: number): Metric | undefined {
  return metrics.find((metric) => metric.id === id);
}

export function updateMetric(id: number, input: NewMetric): Metric | undefined {
  const index = metrics.findIndex((metric) => metric.id === id);
  if (index === -1) return undefined;

  const updated: Metric = {
    id,
    ...input,
  };

  metrics[index] = updated;
  return updated;
}

export function renderValue(value: Value): string {
  switch (value.kind) {
    case "null_value":
      return "null";
    case "number_value":
      return String(value.value);
    case "string_value":
      return value.value;
    case "bool_value":
      return value.value ? "true" : "false";
    case "list_value":
      return `[${value.value.map(renderValue).join(", ")}]`;
    case "struct_value":
      return "{…}";
    default:
      return "";
  }
}


