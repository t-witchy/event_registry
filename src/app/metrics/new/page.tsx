import MetricForm from "../MetricForm";
import NavBar from "@/components/NavBar";

export default function NewMetricPage() {
  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <div className="py-10">
        <main>
          <MetricForm mode="create" />
        </main>
      </div>
    </div>
  );
}


