"use client";

import { useMemo, useState } from "react";
import { Bell, ChevronLeft, ChevronRight, Clock, Plus, Search } from "lucide-react";
import { addMonths, calendarViews, monthLabel, todayISO } from "@/lib/calendar";
import { CalendarItem, Member } from "@/lib/types";
import { Modal } from "./Modal";

const hours = Array.from({ length: 17 }, (_, index) => `${String(index + 6).padStart(2, "0")}:00`);

function getEventPosition(start: string, end: string) {
  const startHour = Number(start.slice(0, 2));
  const startMinute = Number(start.slice(3, 5));
  const endHour = Number(end.slice(0, 2));
  const endMinute = Number(end.slice(3, 5));

  const startTotal = (startHour - 6) * 60 + startMinute;
  const endTotal = Math.max(startTotal + 45, (endHour - 6) * 60 + endMinute);

  return {
    top: 52 + startTotal,
    height: Math.max(58, endTotal - startTotal),
  };
}

export function FamilyCalendar({
  members,
  items,
  onAddItem,
}: {
  members: Member[];
  items: CalendarItem[];
  onAddItem: (item: CalendarItem) => void;
}) {
  const [view, setView] = useState("Semana");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "evento",
    date: todayISO(),
    start: "08:00",
    end: "09:00",
    memberId: members[0]?.id || "",
    priority: "Média",
    color: "#2563eb",
    whatsappReminder: true,
    description: "",
    location: "",
    meetingLink: "",
  });

  const member = useMemo(
    () => members.find((item) => item.id === form.memberId) || members[0],
    [members, form.memberId]
  );

  function openQuickCreate(hour: string) {
    const nextHour = `${String(Math.min(Number(hour.slice(0, 2)) + 1, 23)).padStart(2, "0")}:00`;

    setForm((current) => ({
      ...current,
      start: hour,
      end: nextHour,
    }));

    setModalOpen(true);
  }

  async function submitEvent(event: React.FormEvent) {
    event.preventDefault();

    if (!form.title.trim()) return;

    const newItem: CalendarItem = {
      id: crypto.randomUUID(),
      title: form.title,
      type: form.type as CalendarItem["type"],
      date: form.date,
      start: form.start,
      end: form.end,
      color: form.color,
      memberId: form.memberId,
      memberName: member?.name || "Família",
      priority: form.priority as CalendarItem["priority"],
      location: form.location,
      meetingLink: form.meetingLink,
      description: form.description,
      whatsappReminder: form.whatsappReminder,
      microsteps: form.description
        ? form.description
            .split(".")
            .map((step) => step.trim())
            .filter(Boolean)
        : ["Confirmar detalhes", "Adicionar lembrete", "Executar no horário"],
    };

    onAddItem(newItem);

    if (newItem.whatsappReminder) {
      const savedUsers = JSON.parse(localStorage.getItem("senhor-melo-users") || "[]");
      const targetUser = savedUsers.find((user: any) => user.name === newItem.memberName);
      const phone = targetUser?.phone || savedUsers[0]?.phone;

      if (phone) {
        fetch("/api/whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            message: `🔔 Senhor Melo\n\nLembrete criado:\n${newItem.title}\n${newItem.date} das ${newItem.start} às ${newItem.end}\nResponsável: ${newItem.memberName}`,
          }),
        }).catch(() => {});
      }
    }

    setForm((current) => ({ ...current, title: "", description: "" }));
    setModalOpen(false);
  }

  return (
    <section className="calendar-module">
      <div className="calendar-monthbar">
        <button onClick={() => setCurrentDate(addMonths(currentDate, -1))} aria-label="Mês anterior">
          <ChevronLeft size={18} />
        </button>

        <strong>{monthLabel(currentDate)}</strong>

        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} aria-label="Próximo mês">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="calendar-toolbar">
        <div className="view-tabs">
          {calendarViews.map((item) => (
            <button key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>
              {item}
            </button>
          ))}
        </div>

        <button className="primary-action small" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          Novo
        </button>
      </div>

      <div className="calendar-search">
        <Search size={18} />
        <input placeholder="Pesquisar no calendário" />
      </div>

      <div className="calendar-layout">
        <aside className="mini-calendar">
          <strong>Calendários</strong>

          {["Família", "Plantões", "Escola", "Financeiro", "Tarefas"].map((calendar) => (
            <label key={calendar}>
              <input type="checkbox" defaultChecked /> {calendar}
            </label>
          ))}

          <strong>Mini calendário</strong>

          <div className="month-grid">
            {Array.from({ length: 31 }, (_, index) => (
              <button key={index}>{index + 1}</button>
            ))}
          </div>
        </aside>

        <div className="mobile-agenda-list">
          {items.map((item) => (
            <article className="mobile-agenda-card" key={item.id} style={{ borderLeftColor: item.color }}>
              <div>
                <strong>{item.title}</strong>
                <span>
                  <Clock size={14} /> {item.start} - {item.end}
                </span>
              </div>

              {item.whatsappReminder && (
                <small>
                  <Bell size={14} /> WhatsApp
                </small>
              )}
            </article>
          ))}
        </div>

        <div className="time-grid">
          <div className="now-line" />

          {hours.map((hour) => (
            <button className="time-row" key={hour} onClick={() => openQuickCreate(hour)}>
              <span>{hour}</span>
              <div />
            </button>
          ))}

          {items.map((item, index) => {
            const position = getEventPosition(item.start, item.end);

            return (
              <article
                className="calendar-event"
                key={item.id}
                draggable
                style={{
                  background: item.color,
                  top: position.top,
                  height: position.height,
                  left: `calc(86px + ${(index % 2) * 42}%)`,
                }}
              >
                <strong>{item.title}</strong>
                <span>{item.start} - {item.end}</span>

                {item.whatsappReminder && (
                  <small>
                    <Bell size={13} /> WhatsApp
                  </small>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <button className="floating-add" onClick={() => setModalOpen(true)}>
        +
      </button>

      <Modal title="Criar item na agenda" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid" onSubmit={submitEvent}>
          <input
            placeholder="Título"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />

          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option value="evento">Evento</option>
            <option value="tarefa">Tarefa</option>
            <option value="reuniao">Reunião</option>
            <option value="lembrete">Lembrete</option>
            <option value="meta">Meta</option>
            <option value="bloqueio">Bloqueio de tempo</option>
          </select>

          <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />

          <div className="two-cols">
            <input type="time" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} />
            <input type="time" value={form.end} onChange={(event) => setForm({ ...form, end: event.target.value })} />
          </div>

          <select value={form.memberId} onChange={(event) => setForm({ ...form, memberId: event.target.value })}>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>

          <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
            <option>Alta</option>
            <option>Média</option>
            <option>Baixa</option>
          </select>

          <input
            placeholder="Localização"
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
          />

          <input
            placeholder="Link de reunião"
            value={form.meetingLink}
            onChange={(event) => setForm({ ...form, meetingLink: event.target.value })}
          />

          <textarea
            placeholder="Descrição ou microetapas"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />

          <label className="switch-row">
            <input
              type="checkbox"
              checked={form.whatsappReminder}
              onChange={(event) => setForm({ ...form, whatsappReminder: event.target.checked })}
            />
            Receber lembrete no WhatsApp
          </label>

          <button className="primary-action" type="submit">
            Adicionar à agenda
          </button>
        </form>
      </Modal>
    </section>
  );
}
