"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Plus, Syringe } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentFamilyId } from "@/lib/familySession";

type VaccineRecord = {
  id: string;
  child_name: string;
  vaccine_name: string;
  dose: string;
  expected_age: string;
  due_date: string;
  applied_date?: string;
  place?: string;
  notes?: string;
  whatsapp_reminder: boolean;
};

const SUS_BASE = [
  ["BCG", "Dose única", "Ao nascer"],
  ["Hepatite B", "Dose ao nascer", "Ao nascer"],
  ["Pentavalente", "1ª dose", "2 meses"],
  ["VIP", "1ª dose", "2 meses"],
  ["Pneumocócica 10", "1ª dose", "2 meses"],
  ["Rotavírus", "1ª dose", "2 meses"],
  ["Meningocócica C", "1ª dose", "3 meses"],
  ["Pentavalente", "2ª dose", "4 meses"],
  ["Tríplice viral", "1ª dose", "12 meses"],
  ["Hepatite A", "Dose única", "15 meses"],
];

export default function VacinasPage() {
  const [records, setRecords] = useState<VaccineRecord[]>([]);
  const [form, setForm] = useState({
    child_name: "",
    vaccine_name: "",
    dose: "",
    expected_age: "",
    due_date: "",
    applied_date: "",
    place: "",
    notes: "",
    whatsapp_reminder: true,
  });

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    const local = localStorage.getItem(`senhor-melo-vaccines-${getCurrentFamilyId()}`);
    if (local) setRecords(JSON.parse(local));

    if (!supabase) return;

    const { data } = await supabase
      .from("vaccine_records")
      .select("*")
      .eq("family_id", getCurrentFamilyId())
      .order("due_date", { ascending: true });

    if (data) setRecords(data as VaccineRecord[]);
  }

  async function saveRecord(event: React.FormEvent) {
    event.preventDefault();

    const payload: VaccineRecord = {
      id: crypto.randomUUID(),
      ...form,
    };

    const next = [payload, ...records];
    setRecords(next);
    localStorage.setItem(`senhor-melo-vaccines-${getCurrentFamilyId()}`, JSON.stringify(next));

    if (supabase) {
      await supabase.from("vaccine_records").insert({
        ...payload,
        family_id: getCurrentFamilyId(),
      });
    }

    setForm({
      child_name: "",
      vaccine_name: "",
      dose: "",
      expected_age: "",
      due_date: "",
      applied_date: "",
      place: "",
      notes: "",
      whatsapp_reminder: true,
    });
  }

  const pending = useMemo(() => records.filter((item) => !item.applied_date), [records]);

  return (
    <>
      <section className="hero-section">
        <span className="badge">Saúde familiar</span>
        <h1>Cartão de vacinas dos filhos.</h1>
        <p className="lead">Cadastre vacinas, doses, datas previstas, aplicação e lembretes pelo WhatsApp.</p>
      </section>

      <section className="auth-layout">
        <form className="auth-card" onSubmit={saveRecord}>
          <h2>Adicionar vacina</h2>
          <input placeholder="Nome da criança" value={form.child_name} onChange={(e) => setForm({ ...form, child_name: e.target.value })} required />
          <input placeholder="Nome da vacina" value={form.vaccine_name} onChange={(e) => setForm({ ...form, vaccine_name: e.target.value })} required />
          <input placeholder="Dose. Ex: 1ª dose" value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} />
          <input placeholder="Idade prevista. Ex: 2 meses" value={form.expected_age} onChange={(e) => setForm({ ...form, expected_age: e.target.value })} />
          <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
          <input type="date" value={form.applied_date} onChange={(e) => setForm({ ...form, applied_date: e.target.value })} />
          <input placeholder="Unidade/local" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} />
          <textarea placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <label className="switch-row">
            <input type="checkbox" checked={form.whatsapp_reminder} onChange={(e) => setForm({ ...form, whatsapp_reminder: e.target.checked })} />
            Lembrar no WhatsApp
          </label>

          <button className="primary-action" type="submit"><Plus size={18} /> Salvar vacina</button>
        </form>

        <aside className="users-list-card">
          <h2>Calendário SUS base</h2>
          <p>Use como referência inicial. Confirme sempre com o posto de saúde/pediatra.</p>
          {SUS_BASE.map(([name, dose, age]) => (
            <article className="registered-user" key={`${name}-${dose}-${age}`}>
              <strong>{name}</strong>
              <span>{dose}</span>
              <small>{age}</small>
            </article>
          ))}
        </aside>
      </section>

      <section className="panel-card" style={{ marginTop: 20 }}>
        <h2>Vacinas pendentes</h2>
        {pending.length === 0 && <p className="empty-list">Nenhuma vacina pendente.</p>}
        <div className="summary-list">
          {pending.map((item) => (
            <article key={item.id}>
              <Syringe />
              <div>
                <strong>{item.child_name} • {item.vaccine_name}</strong>
                <span>{item.dose} • {item.expected_age} • prevista para {item.due_date}</span>
                {item.whatsapp_reminder && <small><Bell size={13} /> WhatsApp ativo</small>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
