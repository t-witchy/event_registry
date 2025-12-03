import EventForm from "../EventForm";
import { getEvent } from "@/lib/events";
import { notFound } from "next/navigation";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNumber = Number(id);
  const event = getEvent(idNumber);

  if (!event) {
    notFound();
  }

  return <EventForm mode="edit" initialEvent={event} />;
}



