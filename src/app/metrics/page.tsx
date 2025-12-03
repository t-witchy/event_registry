"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Metric, EventPropertyFilterOperator } from "@/lib/metrics";
import { renderValue } from "@/lib/metrics";
import NavBar from "@/components/NavBar";

function formatOperator(op: EventPropertyFilterOperator): string {
  switch (op) {
    case "EVENT_PROPERTY_FILTER_OPERATOR_EQUALS":
      return "equals";
    case "EVENT_PROPERTY_FILTER_OPERATOR_NOT_EQUALS":
      return "not equals";
    case "EVENT_PROPERTY_FILTER_OPERATOR_LESS_THAN":
      return "less than";
    case "EVENT_PROPERTY_FILTER_OPERATOR_LESS_THAN_OR_EQUAL":
      return "≤";
    case "EVENT_PROPERTY_FILTER_OPERATOR_GREATER_THAN":
      return "greater than";
    case "EVENT_PROPERTY_FILTER_OPERATOR_GREATER_THAN_OR_EQUAL":
      return "≥";
    case "EVENT_PROPERTY_FILTER_OPERATOR_CONTAINS":
      return "contains";
    case "EVENT_PROPERTY_FILTER_OPERATOR_NOT_CONTAINS":
      return "does not contain";
    case "EVENT_PROPERTY_FILTER_OPERATOR_UNSPECIFIED":
    default:
      return "—";
  }
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/metrics");
        if (!res.ok) return;
        const data = (await res.json()) as { metrics?: Metric[] };
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      } catch {
        // ignore for now
      }
    }

    void loadMetrics();
  }, []);

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Metrics
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0 lg:px-0">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Metric definitions
                  </h2>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    Each metric wraps an underlying event property filter. Later
                    you can connect these to dashboards or alerting.
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                  <Link
                    href="/metrics/new"
                    className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                  >
                    Add metric
                  </Link>
                </div>
              </div>
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0 dark:text-white"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                          >
                            Description
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                          >
                            Filters
                          </th>
                          <th
                            scope="col"
                            className="py-3.5 pr-4 pl-3 sm:pr-0"
                          >
                            <span className="sr-only">Edit</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                        {metrics.map((metric) => (
                          <tr key={metric.id}>
                            <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">
                              {metric.name}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {metric.description}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {metric.eventPropertyFilters.map(
                                (filter, index) => (
                                  <div key={`${filter.eventPropertyName}-${index}`}>
                                    {index > 0 && (
                                      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                        AND
                                      </span>
                                    )}
                                    <span className="font-mono text-gray-900 dark:text-gray-50">
                                      {filter.eventPropertyName}
                                    </span>{" "}
                                    <span>
                                      {formatOperator(
                                        filter.eventPropertyFilterOperator,
                                      )}
                                    </span>{" "}
                                    <span className="font-mono text-gray-900 dark:text-gray-50">
                                      {renderValue(filter.eventPropertyFilterValue)}
                                    </span>
                                  </div>
                                ),
                              )}
                            </td>
                            <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                              <Link
                                href={`/metrics/${metric.id}`}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                Edit
                                <span className="sr-only">, {metric.name}</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


