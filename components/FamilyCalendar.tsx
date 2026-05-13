"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { CalendarItem, Member } from "@/lib/types";

type Props = {
  members: Member[];
  items: CalendarItem[];
  onAddItem: (item: CalendarItem) => void;
  onUpdateItem?: (item: CalendarItem) => void;
  onDeleteItem?: (id: string) => void;
};

const emptyForm = {
  title: "",
  type: "evento",
  date: new Date().toISOString().slice(0, 10),
  start: "08:00",
  end: "09:00",
  memberName: "Família",
  priority: "Média",
  location: "",
  description: "",
  whatsappReminder: true,
};

export function FamilyCalendar({ members, items, onAddItem, onUpdateItem, onDeleteItem }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();

    return items
      .filter((item) => {
        if (!q) return true;

        return [
          item.title,
          item.description,
          item.memberName,
          item.location,
          item.type,
          item.priority,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
  }, [items, search]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const selectedMember = members.find((member) => member.name === form.memberName);

    const payload: CalendarItem = {
      id: editingId || crypto.randomUUID(),
      title: form.title,
      type: form.type as CalendarItem["type"],
      date: form.date,
      start: form.start,
      end: form.end,
      color: selectedMember?.color || "#2563eb",
      memberId: selectedMember?.id || "",
      memberName: form.memberName || "Família",
      priority: form.priority as CalendarItem["priority"],
      location: form.location,
      description: form.description,
      whatsappReminder: form.whatsappReminder,
      microsteps: [],
    };

    if (editingId && onUpdateItem) {
      onUpdateItem(payload);
    } else {
      onAddItem(payload);
    }

    resetForm();
  }

  function startEdit(item: CalendarItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      type: item.type || "evento",
      date: item.date,
      start: item.start,
      end: item.end,
      memberName: item.memberName || "Família",
      priority: item.priority || "Média",
      location: item.location || "",
      description: item.description || "",
      whatsappReminder: Boolean(item.whatsappReminder),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteItem(id: string) {
    const ok = window.confirm("Deseja excluir este compromisso?");
    if (!ok) return;

    onDeleteItem?.(id);

    if (editingId === id) resetForm();
  }

  return (
    <section className="panel-card">
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarDays size={22} />
            Agenda da família
          </h2>

          {editingId && (
            <button className="danger-action" type="button" onClick={resetForm}>
              Cancelar edição
            </button>
          )}
        </div>

        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <input
            placeholder="Título do compromisso"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />

          <div className="form-grid">
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option value="evento">Evento</option>
              <option value="tarefa">Tarefa</option>
              <option value="reuniao">Reunião</option>
              <option value="lembrete">Lembrete</option>
            </select>

            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />

            <input type="time" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} required />

            <input type="time" value={form.end} onChange={(event) => setForm({ ...form, end: event.target.value })} required />
          </div>

          <div className="form-grid">
            <select value={form.memberName} onChange={(event) => setForm({ ...form, memberName: event.target.value })}>
              <option>Família</option>
              {members.map((member) => (
                <option key={member.id}>{member.name}</option>
              ))}
            </select>

            <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
              <option>Baixa</option>
              <option>Média</option>
              <option>Alta</option>
            </select>
          </div>

          <input
            placeholder="Local opcional"
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
          />

          <textarea
            placeholder="Descrição opcional"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            rows={3}
          />

          <label className="switch-row">
            <input
              type="checkbox"
              checked={form.whatsappReminder}
              onChange={(event) => setForm({ ...form, whatsappReminder: event.target.checked })}
            />
            Lembrar no WhatsApp
          </label>

          <button className="primary-action" type="submit">
            <Plus size={18} />
            {editingId ? "Salvar alterações" : "Adicionar compromisso"}
          </button>
        </form>

        <input
          placeholder="Buscar na agenda"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="summary-list">
          {filteredItems.length === 0 && <p className="empty-list">Nenhum compromisso encontrado.</p>}

          {filteredItems.map((item) => (
            <article key={item.id}>
              <CalendarDays />
              <div>
                <strong>{item.title}</strong>
                <span>
                  {item.date} • {item.start} - {item.end} • {item.memberName || "Família"}
                </span>
                {item.description && <small>{item.description}</small>}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                  <button className="primary-action small" type="button" onClick={() => startEdit(item)}>
                    <Pencil size={15} />
                    Editar
                  </button>

                  <button className="danger-action" type="button" onClick={() => deleteItem(item.id)}>
                    <Trash2 size={15} />
                    Excluir
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
