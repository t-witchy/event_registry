import { prisma } from "@/lib/prisma";
import NavBar from "@/components/NavBar";
import Link from "next/link";
import type { Platform, Prisma } from "@prisma/client";

type SearchParams = { [key: string]: string | string[] | undefined };

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

export default async function InterfacesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const view = (searchParams.view as string) ?? "grouped";
  const q = (searchParams.q as string) ?? "";
  const platformParams = searchParams.platform;
  const groupIdParam = searchParams.groupId as string | undefined;

  const platforms: Platform[] = Array.isArray(platformParams)
    ? (platformParams as Platform[])
    : platformParams
      ? ([platformParams] as Platform[])
      : [];

  const groupId = groupIdParam ? Number(groupIdParam) : undefined;

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

  const [interfaces, groups, tags] = await Promise.all([
    prisma.interface.findMany({
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
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.interfaceGroup.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const enriched = interfaces.map((iface) => {
    const elementCount = iface.elements.length;
    const distinctEventIds = new Set<number>();
    iface.elements.forEach((el) =>
      el.events.forEach((e) => distinctEventIds.add(e.eventId)),
    );

    return {
      ...iface,
      elementCount,
      distinctEventCount: distinctEventIds.size,
      tagObjects: iface.tags.map((it) => it.tag),
    };
  });

  const grouped = enriched.reduce<
    Record<
      string,
      {
        groupId: number | null;
        groupName: string;
        interfaces: (typeof enriched)[number][];
      }
    >
  >((acc, iface) => {
    const key = iface.interfaceGroup?.id?.toString() ?? "ungrouped";
    if (!acc[key]) {
      acc[key] = {
        groupId: iface.interfaceGroup?.id ?? null,
        groupName: iface.interfaceGroup?.name ?? "Ungrouped",
        interfaces: [],
      };
    }
    acc[key].interfaces.push(iface);
    return acc;
  }, {});

  const groupList = Object.values(grouped);

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Interfaces
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0 lg:px-0">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Interface registry
                  </h2>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    Browse product interfaces across platforms and jump into
                    details for elements and events.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-x-3 sm:mt-0 sm:ml-16 sm:flex-none">
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <Link
                      href={{
                        pathname: "/interfaces",
                        query: { ...searchParams, view: "grouped" },
                      }}
                      className={`px-3 py-1.5 text-sm font-medium ring-1 ring-inset ${
                        view === "grouped"
                          ? "bg-gray-900 text-white ring-gray-900 dark:bg-white dark:text-gray-900 dark:ring-white"
                          : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
                      } rounded-l-md`}
                    >
                      Grouped
                    </Link>
                    <Link
                      href={{
                        pathname: "/interfaces",
                        query: { ...searchParams, view: "flat" },
                      }}
                      className={`px-3 py-1.5 text-sm font-medium ring-1 ring-inset -ml-px ${
                        view === "flat"
                          ? "bg-gray-900 text-white ring-gray-900 dark:bg-white dark:text-gray-900 dark:ring-white"
                          : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
                      } rounded-r-md`}
                    >
                      Flat
                    </Link>
                  </div>
                  <Link
                    href="/interfaces/new"
                    className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                  >
                    + New Interface
                  </Link>
                </div>
              </div>

              {/* Filters */}
              <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="search"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Search
                  </label>
                  <input
                    id="search"
                    name="q"
                    defaultValue={q}
                    placeholder="Search by name, group, or tag"
                    className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Platform
                  </span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(["IOS", "ANDROID", "WEB"] as Platform[]).map((p) => {
                      const checked = platforms.includes(p);
                      return (
                        <label
                          key={p}
                          className="inline-flex items-center gap-x-1 text-xs font-medium text-gray-700 dark:text-gray-200"
                        >
                          <input
                            type="checkbox"
                            name="platform"
                            value={p}
                            defaultChecked={checked}
                            className="size-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
                          />
                          <span>{platformLabel(p)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="groupId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Interface group
                  </label>
                  <select
                    id="groupId"
                    name="groupId"
                    defaultValue={groupId ?? ""}
                    className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:focus:ring-indigo-500"
                  >
                    <option value="">All groups</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="tagId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Tag
                  </label>
                  <select
                    id="tagId"
                    name="tagId"
                    defaultValue=""
                    className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:focus:ring-indigo-500"
                  >
                    <option value="">All tags</option>
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4 flex justify-end gap-x-3">
                  <Link
                    href="/interfaces"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Clear
                  </Link>
                  <button
                    type="submit"
                    className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                  >
                    Apply filters
                  </button>
                </div>
              </form>

              {/* Table */}
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow-sm outline-1 outline-black/5 sm:rounded-lg dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
                      <table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
                        <thead className="bg-gray-50 dark:bg-gray-800/75">
                          <tr>
                            <th
                              scope="col"
                              className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-200"
                            >
                              Interface
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                            >
                              Platform
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                            >
                              Group
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                            >
                              Tags
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                            >
                              Elements
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                            >
                              Events
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                            >
                              Last updated
                            </th>
                            <th
                              scope="col"
                              className="py-3.5 pr-4 pl-3 sm:pr-6"
                            >
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-white/10 dark:bg-gray-800/50">
                          {view === "grouped"
                            ? groupList.flatMap((group) => {
                                const headerRow = (
                                  <tr key={`group-${group.groupId ?? "ungrouped"}`}>
                                    <td
                                      colSpan={8}
                                      className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-800 sm:px-6 dark:bg-gray-900 dark:text-gray-100"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>{group.groupName}</span>
                                        <span className="text-xs font-normal text-gray-600 dark:text-gray-400">
                                          {group.interfaces.length} interfaces •{" "}
                                          {
                                            new Set(
                                              group.interfaces.flatMap((iface) =>
                                                iface.elements.map((el) =>
                                                  el.events.map((e) => e.eventId),
                                                ),
                                              ).flat(),
                                            ).size
                                          }{" "}
                                          distinct events
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );

                                const rows = group.interfaces.map((iface) => (
                                  <tr key={iface.id}>
                                    <td className="py-4 pr-3 pl-4 text-sm font-medium text-gray-900 sm:pl-6 dark:text-white">
                                      <div className="flex items-center gap-x-3">
                                        {iface.imageUrl ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img
                                            src={iface.imageUrl}
                                            alt={iface.name}
                                            className="size-10 shrink-0 rounded border border-gray-200 object-cover dark:border-white/10"
                                          />
                                        ) : (
                                          <div className="flex size-10 shrink-0 items-center justify-center rounded border border-dashed border-gray-300 text-xs text-gray-400 dark:border-white/15 dark:text-gray-500">
                                            No image
                                          </div>
                                        )}
                                        <span>{iface.name}</span>
                                      </div>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                                        {platformLabel(iface.platform)}
                                      </span>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                      {iface.interfaceGroup?.name ?? "—"}
                                    </td>
                                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                      <div className="flex flex-wrap gap-1">
                                        {iface.tagObjects.map((tag) => (
                                          <span
                                            key={tag.id}
                                            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                                          >
                                            {tag.name}
                                          </span>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                      {iface.elementCount}
                                    </td>
                                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                      {iface.distinctEventCount}
                                    </td>
                                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                      {iface.updatedAt.toLocaleDateString()}
                                    </td>
                                    <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                                      <div className="inline-flex items-center gap-x-3">
                                        <Link
                                          href={`/interfaces/${iface.id}`}
                                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                          View
                                        </Link>
                                        <Link
                                          href={`/interfaces/${iface.id}/edit`}
                                          className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                        >
                                          Edit
                                        </Link>
                                        <button
                                          type="button"
                                          className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                                          disabled
                                          title="Delete action to be implemented"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ));

                                return [headerRow, ...rows];
                              })
                            : enriched.map((iface) => (
                                <tr key={iface.id}>
                                  <td className="py-4 pr-3 pl-4 text-sm font-medium text-gray-900 sm:pl-6 dark:text-white">
                                    <div className="flex items-center gap-x-3">
                                      {iface.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={iface.imageUrl}
                                          alt={iface.name}
                                          className="size-10 shrink-0 rounded border border-gray-200 object-cover dark:border-white/10"
                                        />
                                      ) : (
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded border border-dashed border-gray-300 text-xs text-gray-400 dark:border-white/15 dark:text-gray-500">
                                          No image
                                        </div>
                                      )}
                                      <span>{iface.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                                      {platformLabel(iface.platform)}
                                    </span>
                                  </td>
                                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {iface.interfaceGroup?.name ?? "—"}
                                  </td>
                                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-wrap gap-1">
                                      {iface.tagObjects.map((tag) => (
                                        <span
                                          key={tag.id}
                                          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                                        >
                                          {tag.name}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {iface.elementCount}
                                  </td>
                                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {iface.distinctEventCount}
                                  </td>
                                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {iface.updatedAt.toLocaleDateString()}
                                  </td>
                                  <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                                    <div className="inline-flex items-center gap-x-3">
                                      <Link
                                        href={`/interfaces/${iface.id}`}
                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                      >
                                        View
                                      </Link>
                                      <Link
                                        href={`/interfaces/${iface.id}/edit`}
                                        className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                      >
                                        Edit
                                      </Link>
                                      <button
                                        type="button"
                                        className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                                        disabled
                                        title="Delete action to be implemented"
                                      >
                                        Delete
                                      </button>
                                    </div>
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
          </div>
        </main>
      </div>
    </div>
  );
}


