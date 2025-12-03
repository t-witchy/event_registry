import MetricForm from "../MetricForm";
import NavBar from "@/components/NavBar";
import { getMetric } from "@/lib/metrics";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

export default function EditMetricPage({ params }: PageProps) {
  const id = Number(params.id);
  const metric = getMetric(id);

  if (!metric) {
    notFound();
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <div className="py-10">
        <main>
          <MetricForm mode="edit" initialMetric={metric} />
        </main>
      </div>
    </div>
  );
}


