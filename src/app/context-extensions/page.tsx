import { prisma } from "@/lib/prisma";
import NavBar from "@/components/NavBar";

export default async function ContextExtensionsPage() {
  const contextExtensions = await prisma.contextExtension.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Context Extensions
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0 lg:px-0">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Context extension registry
                  </h2>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    A catalog of analytics context extension messages used across
                    the product.
                  </p>
                </div>
              </div>
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
                              Name
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                            >
                              Description
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                            >
                              Deprecated
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-white/10 dark:bg-gray-800/50">
                          {contextExtensions.map((ce) => (
                            <tr key={ce.id}>
                              <td className="py-4 pr-3 pl-4 text-sm font-medium text-gray-900 sm:pl-6 dark:text-white">
                                {ce.name}
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {ce.description}
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {ce.deprecated ? (
                                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-900/30 dark:text-red-200 dark:ring-red-500/40">
                                    Deprecated
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-500/40">
                                    Active
                                  </span>
                                )}
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


