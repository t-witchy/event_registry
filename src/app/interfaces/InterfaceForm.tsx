"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Platform } from "@prisma/client";

type InterfaceGroup = {
  id: number;
  name: string;
};

type Tag = {
  id: number;
  name: string;
};

type InterfaceEventDraft = {
  id: string;
  canonicalName: string;
  isPrimary: boolean;
  notes: string;
};

type ElementEventDraft = {
  id: string;
  canonicalName: string;
  isPrimary: boolean;
  notes: string;
};

type ElementDraft = {
  id: string;
  name: string;
  description: string;
  displayLabel: string;
  position: string;
  notes: string;
  events: ElementEventDraft[];
};

type InterfaceFormState = {
  name: string;
  platform: Platform;
  figmaUrl: string;
  description: string;
  imageUrl: string;
  interfaceGroupId: string;
  tagIds: number[];
  interfaceEvents: InterfaceEventDraft[];
  elements: ElementDraft[];
};

type MetaResponse = {
  groups: InterfaceGroup[];
  tags: Tag[];
};

function platformLabel(platform: Platform): string {
  switch (platform) {
    case "IOS":
      return "iOS";
    case "ANDROID":
      return "Android";
    case "WEB":
      return "Web";
    default:
      return platform;
  }
}

function createElementDraft(): ElementDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    displayLabel: "",
    position: "",
    notes: "",
    events: [],
  };
}

function createEventDraft(): ElementEventDraft {
  return {
    id: crypto.randomUUID(),
    canonicalName: "",
    isPrimary: false,
    notes: "",
  };
}

export default function InterfaceForm() {
  const router = useRouter();

  const [form, setForm] = useState<InterfaceFormState>({
    name: "",
    platform: "WEB",
    figmaUrl: "",
    description: "",
    imageUrl: "",
    interfaceGroupId: "",
    tagIds: [],
    interfaceEvents: [],
    elements: [],
  });
  const [groups, setGroups] = useState<InterfaceGroup[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      try {
        const res = await fetch("/api/interfaces");
        if (!res.ok) return;
        const data = (await res.json()) as MetaResponse & {
          // other fields ignored
        };
        if (data.groups) setGroups(data.groups);
        if (data.tags) setTags(data.tags);
      } catch {
        // ignore for now
      }
    }

    void loadMeta();
  }, []);

  function updateElement(id: string, updater: (prev: ElementDraft) => ElementDraft) {
    setForm((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === id ? updater(el) : el)),
    }));
  }

  function addElement() {
    setForm((prev) => ({
      ...prev,
      elements: [...prev.elements, createElementDraft()],
    }));
  }

  function removeElement(id: string) {
    setForm((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }));
  }

  function addEventToElement(elementId: string) {
    updateElement(elementId, (el) => ({
      ...el,
      events: [...el.events, createEventDraft()],
    }));
  }

  function updateEventOnElement(
    elementId: string,
    eventId: string,
    updater: (prev: ElementEventDraft) => ElementEventDraft,
  ) {
    updateElement(elementId, (el) => ({
      ...el,
      events: el.events.map((ev) => (ev.id === eventId ? updater(ev) : ev)),
    }));
  }

  function removeEventFromElement(elementId: string, eventId: string) {
    updateElement(elementId, (el) => ({
      ...el,
      events: el.events.filter((ev) => ev.id !== eventId),
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name,
        platform: form.platform,
        figmaUrl: form.figmaUrl || undefined,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        interfaceGroupId: form.interfaceGroupId
          ? Number(form.interfaceGroupId)
          : null,
        tagIds: form.tagIds,
        interfaceEvents: form.interfaceEvents
          .filter((ev) => ev.canonicalName.trim())
          .map((ev) => ({
            canonicalName: ev.canonicalName.trim(),
            isPrimary: ev.isPrimary,
            notes: ev.notes || undefined,
          })),
        elements: form.elements
          .filter((el) => el.name.trim())
          .map((el) => ({
            name: el.name.trim(),
            description: el.description || undefined,
            displayLabel: el.displayLabel || undefined,
            position: el.position ? Number(el.position) : undefined,
            notes: el.notes || undefined,
            events: el.events
              .filter((ev) => ev.canonicalName.trim())
              .map((ev) => ({
                canonicalName: ev.canonicalName.trim(),
                isPrimary: ev.isPrimary,
                notes: ev.notes || undefined,
              })),
          })),
      };

      const res = await fetch("/api/interfaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setIsSubmitting(false);
        return;
      }

      router.push("/interfaces");
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Add interface
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Define a product interface and optionally associate UI elements and
        events that occur on this screen.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-12">
        {/* Interface details */}
        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
            Interface details
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
            Basic information about the screen, including platform and group.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
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
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                  placeholder="Game Home – iOS"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="platform"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Platform
              </label>
              <div className="mt-2">
                <select
                  id="platform"
                  name="platform"
                  value={form.platform}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      platform: e.target.value as Platform,
                    }))
                  }
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:focus:ring-indigo-500"
                >
                  <option value="WEB">{platformLabel("WEB")}</option>
                  <option value="IOS">{platformLabel("IOS")}</option>
                  <option value="ANDROID">{platformLabel("ANDROID")}</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="group"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Interface group
              </label>
              <div className="mt-2">
                <select
                  id="group"
                  name="group"
                  value={form.interfaceGroupId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      interfaceGroupId: e.target.value,
                    }))
                  }
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:focus:ring-indigo-500"
                >
                  <option value="">No group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="tags"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Tags
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = form.tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          tagIds: selected
                            ? prev.tagIds.filter((id) => id !== tag.id)
                            : [...prev.tagIds, tag.id],
                        }))
                      }
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        selected
                          ? "bg-indigo-600 text-white ring-indigo-600 dark:bg-indigo-500 dark:ring-indigo-500"
                          : "bg-gray-100 text-gray-800 ring-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
                {tags.length === 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    No tags defined yet.
                  </span>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="figmaUrl"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Figma URL
              </label>
              <div className="mt-2">
                <input
                  id="figmaUrl"
                  name="figmaUrl"
                  type="url"
                  value={form.figmaUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, figmaUrl: e.target.value }))
                  }
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                  placeholder="https://www.figma.com/file/..."
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Screenshot URL
              </label>
              <div className="mt-2">
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                  }
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                  placeholder="https://..."
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
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                  placeholder="High-level description of what this interface represents and how it's used."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interface-level events */}
        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
            Interface-level events
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
            Events that are associated with the interface as a whole (e.g.
            pageview, impressions) rather than a specific element.
          </p>

          <div className="mt-6 space-y-3">
            {form.interfaceEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3 text-xs dark:border-white/10 dark:bg-gray-900/60"
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300">
                      Event canonical name
                    </label>
                    <input
                      type="text"
                      value={ev.canonicalName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          interfaceEvents: prev.interfaceEvents.map((x) =>
                            x.id === ev.id
                              ? { ...x, canonicalName: e.target.value }
                              : x,
                          ),
                        }))
                      }
                      placeholder="ScreenViewed, InterfaceLoaded, etc."
                      className="mt-1 block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      id={`iface-primary-${ev.id}`}
                      type="checkbox"
                      checked={ev.isPrimary}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          interfaceEvents: prev.interfaceEvents.map((x) =>
                            x.id === ev.id
                              ? { ...x, isPrimary: e.target.checked }
                              : x,
                          ),
                        }))
                      }
                      className="size-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900"
                    />
                    <label
                      htmlFor={`iface-primary-${ev.id}`}
                      className="text-[11px] text-gray-700 dark:text-gray-300"
                    >
                      Primary
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300">
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      value={ev.notes}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          interfaceEvents: prev.interfaceEvents.map((x) =>
                            x.id === ev.id ? { ...x, notes: e.target.value } : x,
                          ),
                        }))
                      }
                      className="mt-1 block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        interfaceEvents: prev.interfaceEvents.filter(
                          (x) => x.id !== ev.id,
                        ),
                      }))
                    }
                    className="self-end text-[11px] font-semibold text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove event
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  interfaceEvents: [...prev.interfaceEvents, createEventDraft()],
                }))
              }
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-800"
            >
              Add interface event
            </button>
          </div>
        </div>

        {/* Elements and events */}
        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
            Elements and events
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
            Optionally capture UI elements on this screen and the events they
            emit when users interact.
          </p>

          <div className="mt-8 space-y-6">
            {form.elements.map((element) => (
              <div
                key={element.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-gray-900/60"
              >
                <div className="flex items-start justify-between gap-x-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                      Element name
                    </label>
                    <input
                      type="text"
                      value={element.name}
                      onChange={(e) =>
                        updateElement(element.id, (prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Play button, Primary CTA, etc."
                      className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeElement(element.id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Display label (optional)
                    </label>
                    <input
                      type="text"
                      value={element.displayLabel}
                      onChange={(e) =>
                        updateElement(element.id, (prev) => ({
                          ...prev,
                          displayLabel: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Position (optional)
                    </label>
                    <input
                      type="number"
                      value={element.position}
                      onChange={(e) =>
                        updateElement(element.id, (prev) => ({
                          ...prev,
                          position: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      value={element.notes}
                      onChange={(e) =>
                        updateElement(element.id, (prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Events
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Add one or more events that are fired when users interact
                    with this element.
                  </p>

                  <div className="mt-3 space-y-3">
                    {element.events.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-2 text-xs dark:border-white/10 dark:bg-gray-800"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300">
                              Event canonical name
                            </label>
                            <input
                              type="text"
                              value={ev.canonicalName}
                              onChange={(e) =>
                                updateEventOnElement(element.id, ev.id, (prev) => ({
                                  ...prev,
                                  canonicalName: e.target.value,
                                }))
                              }
                              placeholder="GameStarted, HomeCTAClicked, etc."
                              className="mt-1 block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              id={`primary-${ev.id}`}
                              type="checkbox"
                              checked={ev.isPrimary}
                              onChange={(e) =>
                                updateEventOnElement(element.id, ev.id, (prev) => ({
                                  ...prev,
                                  isPrimary: e.target.checked,
                                }))
                              }
                              className="size-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900"
                            />
                            <label
                              htmlFor={`primary-${ev.id}`}
                              className="text-[11px] text-gray-700 dark:text-gray-300"
                            >
                              Primary
                            </label>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300">
                              Notes (optional)
                            </label>
                            <input
                              type="text"
                              value={ev.notes}
                              onChange={(e) =>
                                updateEventOnElement(element.id, ev.id, (prev) => ({
                                  ...prev,
                                  notes: e.target.value,
                                }))
                              }
                              className="mt-1 block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEventFromElement(element.id, ev.id)}
                            className="self-end text-[11px] font-semibold text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Remove event
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addEventToElement(element.id)}
                    className="mt-3 inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-800"
                  >
                    Add event
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addElement}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-800"
            >
              Add element
            </button>
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
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            {isSubmitting ? "Saving..." : "Save interface"}
          </button>
        </div>
      </form>
    </div>
  );
}


