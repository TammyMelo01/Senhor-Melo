"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Pencil, Plus, Trash2, X } from "lucide-react";
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 56,
  border: "1px solid rgba(15, 23, 42, 0.12)",
  borderRadius: 18,
  background: "#eef4ff",
  padding: "0 16px",
  fontSize: 16,
  outline: "none",
  color: "#0f172a",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 96,
  padding: 16,
  resize: "vertical",
  lineHeight: 1.45,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
  gap: 12,
};

export function FamilyCalendar({
  members,
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: Props) {
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
      .sort((a, b) =>
        `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`)
      );
  }, [items, search]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const selectedMember = members.find(
      (member) => member.name === form.memberName
    );

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
      <div style={{ display: "grid", gap: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <h2
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CalendarDays size={22} />
            Agenda da família
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                minHeight: 44,
                borderRadius: 14,
                padding: "0 14px",
                background: "#fee2e2",
                color: "#b91c1c",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <X size={16} />
              Cancelar edição
            </button>
          )}
        </div>

        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <input
            style={inputStyle}
            placeholder="Título do compromisso"
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            required
          />

          <div style={gridStyle}>
            <select
              style={inputStyle}
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value })
              }
            >
              <option value="evento">Evento</option>
              <option value="tarefa">Tarefa</option>
              <option value="reuniao">Reunião</option>
              <option value="lembrete">Lembrete</option>
            </select>

            <input
              style={inputStyle}
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm({ ...form, date: event.target.value })
              }
              required
            />
          </div>

          <div style={gridStyle}>
            <input
              style={inputStyle}
              type="time"
              value={form.start}
              onChange={(event) =>
                setForm({ ...form, start: event.target.value })
              }
              required
            />

            <input
              style={inputStyle}
              type="time"
              value={form.end}
              onChange={(event) =>
                setForm({ ...form, end: event.target.value })
              }
              required
            />
          </div>

          <div style={gridStyle}>
            <select
              style={inputStyle}
              value={form.memberName}
              onChange={(event) =>
                setForm({ ...form, memberName: event.target.value })
              }
            >
              <option>Família</option>
              {members.map((member) => (
                <option key={member.id}>{member.name}</option>
              ))}
            </select>

            <select
              style={inputStyle}
              value={form.priority}
              onChange={(event) =>
                setForm({ ...form, priority: event.target.value })
              }
            >
              <option>Baixa</option>
              <option>Média</option>
              <option>Alta</option>
            </select>
          </div>

          <input
            style={inputStyle}
            placeholder="Local opcional"
            value={form.location}
            onChange={(event) =>
              setForm({ ...form, location: event.target.value })
            }
          />

          <textarea
            style={textareaStyle}
            placeholder="Descrição opcional"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            rows={3}
          />

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#475569",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            <input
              type="checkbox"
              checked={form.whatsappReminder}
              onChange={(event) =>
                setForm({ ...form, whatsappReminder: event.target.checked })
              }
              style={{ width: 22, height: 22 }}
            />
            Lembrar no WhatsApp
          </label>

          <button className="primary-action" type="submit">
            <Plus size={18} />
            {editingId ? "Salvar alterações" : "Adicionar compromisso"}
          </button>
        </form>

        <input
          style={inputStyle}
          placeholder="Buscar na agenda"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div style={{ display: "grid", gap: 14 }}>
          {filteredItems.length === 0 && (
            <p className="empty-list">Nenhum compromisso encontrado.</p>
          )}

          {filteredItems.map((item) => (
            <article
              key={item.id}
              style={{
                background: "#fff",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                borderRadius: 22,
                padding: 18,
                display: "grid",
                gridTemplateColumns: "28px 1fr",
                gap: 12,
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
                overflow: "hidden",
              }}
            >
              <CalendarDays size={22} />

              <div style={{ minWidth: 0 }}>
                <strong
                  style={{
                    display: "block",
                    fontSize: 18,
                    lineHeight: 1.25,
                    color: "#0f172a",
                    marginBottom: 8,
                    overflowWrap: "anywhere",
                  }}
                >
                  {item.title}
                </strong>

                <span
                  style={{
                    display: "block",
                    color: "#64748b",
                    lineHeight: 1.45,
                    marginBottom: 8,
                  }}
                >
                  {item.date} • {item.start} - {item.end} •{" "}
                  {item.memberName || "Família"}
                </span>

                {item.description && (
                  <small
                    style={{
                      display: "block",
                      color: "#475569",
                      fontSize: 14,
                      lineHeight: 1.45,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {item.description}
                  </small>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginTop: 14,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    style={{
                      minHeight: 48,
                      borderRadius: 16,
                      background: "#2563eb",
                      color: "#fff",
                      fontWeight: 900,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Pencil size={16} />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    style={{
                      minHeight: 48,
                      borderRadius: 16,
                      background: "#fee2e2",
                      color: "#b91c1c",
                      fontWeight: 900,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Trash2 size={16} />
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
