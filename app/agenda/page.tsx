"use client";

import { useEffect, useState } from "react";
import { FamilyCalendar } from "@/components/FamilyCalendar";
import { CalendarItem } from "@/lib/types";
import { initialEvents, initialMembers } from "@/lib/mockData";
import { deleteEventPersisted, loadEvents, saveEvent } from "@/lib/persistentStore";

export default function AgendaPage() {
  const [events, setEvents] = useState<CalendarItem[]>(initialEvents);

  useEffect(() => {
    loadEvents(initialEvents).then(setEvents);
  }, []);

  async function addEvent(item: CalendarItem) {
    setEvents((current) => [item, ...current]);
    await saveEvent(item);
  }

  async function updateEvent(updated: CalendarItem) {
    setEvents((current) =>
      current.map((item) => (item.id === updated.id ? updated : item))
    );
    await saveEvent(updated);
  }

  async function deleteEvent(id: string) {
    setEvents((current) => current.filter((item) => item.id !== id));
    await deleteEventPersisted(id);
  }

  return (
    <>
      <section className="hero-section">
        <span className="badge">Agenda familiar e tarefas</span>
        <h1>Calendário visual completo.</h1>
        <p className="lead">
          Crie, edite e exclua compromissos, tarefas, lembretes e eventos da família.
        </p>
      </section>

      <FamilyCalendar
        members={initialMembers}
        items={events}
        onAddItem={addEvent}
        onUpdateItem={updateEvent}
        onDeleteItem={deleteEvent}
      />
    </>
  );
}

