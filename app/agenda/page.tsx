"use client";

import { useEffect, useState } from "react";
import { FamilyCalendar } from "@/components/FamilyCalendar";
import { initialEvents, initialMembers } from "@/lib/mockData";
import { CalendarItem } from "@/lib/types";
import { loadEvents, saveEvent } from "@/lib/persistentStore";

export default function AgendaPage() {
  const [events, setEvents] = useState<CalendarItem[]>(initialEvents);

  useEffect(() => {
    loadEvents(initialEvents).then(setEvents);
  }, []);

  async function addEvent(item: CalendarItem) {
    setEvents((current) => [item, ...current]);
    await saveEvent(item);
  }

  return (
    <>
      <section className="hero-section">
        <span className="badge">Agenda familiar e tarefas</span>
        <h1>Calendário visual completo.</h1>
        <p className="lead">
          Use dia, 3 dias, semana, mês, ano ou agenda. Clique em qualquer horário para criar tarefa, evento, reunião, lembrete, meta ou bloqueio de tempo.
        </p>
      </section>

      <FamilyCalendar members={initialMembers} items={events} onAddItem={addEvent} />
    </>
  );
}
