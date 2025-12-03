"use client";

import { useState, type FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import type { Event, NewEvent, ProductArea, Source } from "@/lib/events";

type Mode = "create" | "edit";

type EventFormProps = {
  mode: Mode;
  initialEvent?: Event;
};

type EventFormState = {
  name: string;
  canonicalName: string;
  renamedToName: string;
  description: string;
  tags: string;
  productArea: ProductArea;
  source: Source;
};

export default function EventForm({ mode, initialEvent }: EventFormProps) {
  const router = useRouter();

  const initialState: EventFormState = useMemo(
    () => ({
      name: initialEvent?.name ?? "",
      canonicalName: initialEvent?.canonicalName ?? "",
      renamedToName: initialEvent?.renamedToName ?? "",
      description: initialEvent?.description ?? "",
      tags: initialEvent ? initialEvent.tags.join(", ") : "",
      productArea: initialEvent?.productArea ?? "puzzles",
      source: initialEvent?.source ?? "v2 Strongly typed",
    }),
    [initialEvent],
  );

  const [form, setForm] = useState<EventFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const payload: NewEvent = {
      name: form.name,
      canonicalName: form.canonicalName,
      renamedToName: form.renamedToName || null,
      description: form.description,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      productArea: form.productArea,
      source: form.source,
    };

    try {
      const url =
        mode === "create" && !initialEvent
          ? "/api/events"
          : `/api/events/${initialEvent?.id}`;

      const method = mode === "create" && !initialEvent ? "POST" : "PUT";

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

      router.push("/");
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        {mode === "create" ? "Add event" : "Edit event"}
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Define an analytics event, including its canonical name, schema, and
        ownership metadata.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-12">
        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
            Event details
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
            Core identifiers and description for the event.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Display name
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
                  placeholder="Game Started"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="canonicalName"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Canonical name
              </label>
              <div className="mt-2">
                <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 dark:bg-white/5 dark:outline-white/10 dark:focus-within:outline-indigo-500">
                  <div className="shrink-0 text-base text-gray-500 select-none sm:text-sm dark:text-gray-400">
                    event.
                  </div>
                  <input
                    id="canonicalName"
                    name="canonicalName"
                    type="text"
                    required
                    value={form.canonicalName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        canonicalName: e.target.value,
                      }))
                    }
                    placeholder="game_started"
                    className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm dark:bg-transparent dark:text-white dark:placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="renamedToName"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text:white"
              >
                Renamed to (optional)
              </label>
              <div className="mt-2">
                <input
                  id="renamedToName"
                  name="renamedToName"
                  type="text"
                  value={form.renamedToName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      renamedToName: e.target.value,
                    }))
                  }
                  placeholder="game_session_started"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
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
                  className="block w-full rounded-md bg.white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm dark:bg.white/5 dark:text:white dark:outline.white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  placeholder="Recorded when a user starts a new game, including time control and game mode metadata."
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Explain when this event fires and the most important fields in
                its payload.
              </p>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="tags"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Tags
              </label>
              <div className="mt-2">
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder="engagement, gameplay, retention"
                  className="block w-full rounded-md bg.white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm dark:bg.white/5 dark:text-white dark:outline.white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Comma-separated list. These will map to your tags table or
                taxonomy later.
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
            Metadata
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
            Product ownership and source system for this event.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="productArea"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Product area
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  id="productArea"
                  name="productArea"
                  value={form.productArea}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      productArea: e.target.value as ProductArea,
                    }))
                  }
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg.white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm dark:bg.white/5 dark:text-white dark:outline.white/10 dark:*:bg-gray-800 dark:focus:outline-indigo-500"
                >
                  <option value="puzzles">Puzzles</option>
                  <option value="gameplay">Gameplay</option>
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="source"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Source
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  id="source"
                  name="source"
                  value={form.source}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      source: e.target.value as Source,
                    }))
                  }
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg.white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm dark:bg.white/5 dark:text-white dark:outline.white/10 dark:*:bg-gray-800 dark:focus:outline-indigo-500"
                >
                  <option value="v1 Loosely typed">v1 Loosely typed</option>
                  <option value="v2 Strongly typed">v2 Strongly typed</option>
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                Example payload (optional)
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 dark:border-white/25">
                <div className="text-center">
                  <PhotoIcon
                    aria-hidden="true"
                    className="mx-auto size-12 text-gray-300 dark:text-gray-600"
                  />
                  <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    Attach a JSON schema or example payload for future
                    reference. This is optional and can be wired to storage
                    later.
                  </p>
                </div>
              </div>
            </div>
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
                ? "Saving..."
                : "Saving..."
              : mode === "create"
                ? "Save"
                : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}


