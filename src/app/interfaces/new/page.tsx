import NavBar from "@/components/NavBar";
import InterfaceForm from "../InterfaceForm";

export default function NewInterfacePage() {
  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <div className="py-10">
        <main>
          <InterfaceForm />
        </main>
      </div>
    </div>
  );
}


