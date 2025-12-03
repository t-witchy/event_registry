"use client";

import { useState, type FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import type {
  EventPropertyFilterOperator,
  Metric,
  NewMetric,
  Value,
} from "@/lib/metrics";
import type { EventPropertyFilter } from "@/lib/metrics";

type Mode = "create" | "edit";

type MetricFormProps = {
  mode: Mode;
  initialMetric?: Metric;
};

type MetricFormState = {
  name: string;
  description: string;
  filters: EventPropertyFilter[];
  draftPropertyName: string;
  draftOperator: EventPropertyFilterOperator;
  draftValue: string;
};

const operatorOptions: { value: EventPropertyFilterOperator; label: string }[] =
  [
    {
      value: "EVENT_PROPERTY_FILTER_OPERATOR_EQUALS",
      label: "Equals",
    },
    {
      value: "EVENT_PROPERTY_FILTER_OPERATOR_NOT_EQUALS",
      label: "Not equals",
    },
    {
      value: "EVENT_PROPERTY_FILTER_OPERATOR_LESS_THAN",
      label: "Less than",
    },
    {
      value: "EVENT_PROPERTY_FILTER_OPERATOR_LESS_THAN_OR_EQUAL",
      label: "Less than or equal",
    },
    {
      value: "EVENT_PROPERTY_FILTER_OPERATOR_GREATER_THAN",
      label: "Greater than",
    },
    {
      value: "EVENT_PROPERTY_FILTER_OPERATOR_GREATER_THAN_OR_EQUAL",
      label: "Greater than or equal",
    },
    {
      value: "EVENT_PROPERTY_FILTER_OPERATOR_CONTAINS",
      label: "Contains",
    },
    {
      value: "EVENT_PROPERTY_FILTER_OPERATOR_NOT_CONTAINS",
      label: "Does not contain",
    },
  ];

function valueToString(value: Value): string {
  switch (value.kind) {
    case "string_value":
      return value.value;
    case "number_value":
      return String(value.value);
    case "bool_value":
      return value.value ? "true" : "false";
    case "null_value":
      return "";
    case "list_value":
    case "struct_value":
    default:
      return "";
  }
}

function stringToValue(raw: string): Value {
  // For now we treat everything as a string value; this can be extended later
  return { kind: "string_value", value: raw };
}

export default function MetricForm({ mode, initialMetric }: MetricFormProps) {
  const router = useRouter();

  const initialState: MetricFormState = useMemo(
    () => ({
      name: initialMetric?.name ?? "",
      description: initialMetric?.description ?? "",
      filters: initialMetric?.eventPropertyFilters ?? [],
      draftPropertyName: "",
      draftOperator: "EVENT_PROPERTY_FILTER_OPERATOR_EQUALS",
      draftValue: "",
    }),
    [initialMetric],
  );

  const [form, setForm] = useState<MetricFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleAddFilter() {
    if (!form.draftPropertyName || !form.draftValue) {
      return;
    }

    const newFilter: EventPropertyFilter = {
      eventPropertyName: form.draftPropertyName,
      eventPropertyFilterOperator: form.draftOperator,
      eventPropertyFilterValue: stringToValue(form.draftValue),
    };

    setForm((prev) => ({
      ...prev,
      filters: [...prev.filters, newFilter],
      draftPropertyName: "",
      draftOperator: prev.draftOperator,
      draftValue: "",
    }));
  }

  function handleEditFilter(index: number) {
    const filter = form.filters[index];
    if (!filter) return;

    setForm((prev) => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index),
      draftPropertyName: filter.eventPropertyName,
      draftOperator: filter.eventPropertyFilterOperator,
      draftValue: valueToString(filter.eventPropertyFilterValue),
    }));
  }

  function handleRemoveFilter(index: number) {
    setForm((prev) => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    if (form.filters.length === 0) {
      setIsSubmitting(false);
      return;
    }

    const payload: NewMetric = {
      name: form.name,
      description: form.description,
      eventPropertyFilters: form.filters,
    };

    try {
      const url =
        mode === "create" && !initialMetric
          ? "/api/metrics"
          : `/api/metrics/${initialMetric?.id}`;

      const method = mode === "create" && !initialMetric ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setIsSubmitting(false);
        return;
      }

      router.push("/metrics");
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        {mode === "create" ? "Add metric" : "Edit metric"}
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Define a metric on top of an event property filter. Later you can wire
        this to dashboards or experiments.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-12">
        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
            Metric details
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
            Core identifiers and description for the metric.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  placeholder="Games started per day"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Description
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  placeholder="Counts the number of game_started events emitted per calendar day."
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Explain how this metric is calculated and how it should be used.
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
            Event property filters
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
            Add one or more event property filters. All filters are combined
            with AND when evaluating this metric.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="eventPropertyName"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Event property name
              </label>
              <div className="mt-2">
                <input
                  id="eventPropertyName"
                  name="eventPropertyName"
                  type="text"
                  value={form.draftPropertyName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      draftPropertyName: e.target.value,
                    }))
                  }
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  placeholder="event.name or payload.reason"
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Name of the property in the event payload to filter on.
              </p>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="operator"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Operator
              </label>
              <div className="mt-2">
                <select
                  id="operator"
                  name="operator"
                  value={form.draftOperator}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      draftOperator:
                        e.target.value as EventPropertyFilterOperator,
                    }))
                  }
                  className="block w-full rounded-md bg-white py-1.5 pr-3 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus:outline-indigo-500"
                >
                  {operatorOptions.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="value"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Value
              </label>
              <div className="mt-2">
                <input
                  id="value"
                  name="value"
                  type="text"
                  value={form.draftValue}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      draftValue: e.target.value,
                    }))
                  }
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  placeholder="game_started"
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                The value to compare against. For now this is treated as a
                string; you can extend the UI later to support numbers and
                booleans.
              </p>
            </div>

            <div className="col-span-full">
              <button
                type="button"
                onClick={handleAddFilter}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20"
              >
                Add filter
              </button>
            </div>

            {form.filters.length > 0 && (
              <div className="col-span-full">
                <h3 className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
                  Current filters
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  All filters below are combined with AND.
                </p>
                <ul className="mt-4 space-y-2">
                  {form.filters.map((filter, index) => (
                    <li
                      key={`${filter.eventPropertyName}-${index}`}
                      className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm shadow-xs ring-1 ring-inset ring-gray-200 dark:bg-white/5 dark:text-gray-100 dark:ring-white/10"
                    >
                      <div className="flex flex-wrap items-baseline gap-1">
                        {index > 0 && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                            AND
                          </span>
                        )}
                        <span className="font-mono text-gray-900 dark:text-gray-50">
                          {filter.eventPropertyName}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {operatorOptions.find(
                            (op) =>
                              op.value === filter.eventPropertyFilterOperator,
                          )?.label ?? filter.eventPropertyFilterOperator}
                        </span>
                        <span className="font-mono text-gray-900 dark:text-gray-50">
                          {valueToString(filter.eventPropertyFilterValue)}
                        </span>
                      </div>
                      <div className="flex items-center gap-x-3">
                        <button
                          type="button"
                          onClick={() => handleEditFilter(index)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFilter(index)}
                          className="text-xs font-semibold text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:shadow-none dark:focus-visible:outline-indigo-500"
          >
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create metric"
                : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}


