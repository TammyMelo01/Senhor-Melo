"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentFamilyId } from "@/lib/familySession";

type ShoppingItem = {
  id: string;
  name: string;
  quantity: string;
  category: string;
  estimated_price: number;
  bought: boolean;
};

const categories = ["Hortifruti", "Açougue", "Padaria", "Limpeza", "Higiene", "Bebidas", "Mercearia", "Congelados", "Outros"];

export default function ComprasPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [form, setForm] = useState({ name: "", quantity: "1", category: "Mercearia", estimated_price: "" });

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const key = `senhor-melo-shopping-${getCurrentFamilyId()}`;
    const local = localStorage.getItem(key);
    if (local) setItems(JSON.parse(local));

    if (!supabase) return;

    const { data } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("family_id", getCurrentFamilyId())
      .order("created_at", { ascending: false });

    if (data) setItems(data as ShoppingItem[]);
  }

  function persistLocal(next: ShoppingItem[]) {
    setItems(next);
    localStorage.setItem(`senhor-melo-shopping-${getCurrentFamilyId()}`, JSON.stringify(next));
  }

  async function addItem(event: React.FormEvent) {
    event.preventDefault();

    const item: ShoppingItem = {
      id: crypto.randomUUID(),
      name: form.name,
      quantity: form.quantity,
      category: form.category,
      estimated_price: Number(form.estimated_price.replace(",", ".")) || 0,
      bought: false,
    };

    const next = [item, ...items];
    persistLocal(next);

    if (supabase) await supabase.from("shopping_items").insert({ ...item, family_id: getCurrentFamilyId() });

    setForm({ name: "", quantity: "1", category: "Mercearia", estimated_price: "" });
  }

  async function toggleBought(item: ShoppingItem) {
    const updated = { ...item, bought: !item.bought };
    const next = items.map((current) => (current.id === item.id ? updated : current));
    persistLocal(next);
    if (supabase) await supabase.from("shopping_items").update({ bought: updated.bought }).eq("id", item.id);
  }

  async function deleteItem(id: string) {
    const next = items.filter((item) => item.id !== id);
    persistLocal(next);
    if (supabase) await supabase.from("shopping_items").delete().eq("id", id);
  }

  const total = useMemo(() => items.reduce((sum, item) => sum + item.estimated_price, 0), [items]);
  const pending = items.filter((item) => !item.bought);

  return (
    <>
      <section className="hero-section">
        <span className="badge">Lista do mês</span>
        <h1>Compras de supermercado.</h1>
        <p className="lead">Monte a lista da família, marque itens comprados e acompanhe o valor estimado.</p>
      </section>

      <section className="metrics-grid">
        <article className="metric-card">
          <div className="metric-icon green"><ShoppingCart /></div>
          <div>
            <span>Total estimado</span>
            <strong>{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
            <p>{pending.length} item(ns) pendente(s)</p>
          </div>
        </article>
      </section>

      <section className="auth-layout" style={{ marginTop: 20 }}>
        <form className="auth-card" onSubmit={addItem}>
          <h2>Adicionar item</h2>
          <input placeholder="Produto. Ex: arroz" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Quantidade. Ex: 2 kg" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
          <input placeholder="Preço estimado" inputMode="decimal" value={form.estimated_price} onChange={(e) => setForm({ ...form, estimated_price: e.target.value })} />
          <button className="primary-action" type="submit"><Plus size={18} /> Adicionar à lista</button>
        </form>

        <aside className="users-list-card">
          <h2>Lista atual</h2>
          {items.length === 0 && <p className="empty-list">Nenhum item cadastrado.</p>}

          {items.map((item) => (
            <article className="registered-user" key={item.id}>
              <label className="switch-row">
                <input type="checkbox" checked={item.bought} onChange={() => toggleBought(item)} />
                <strong style={{ textDecoration: item.bought ? "line-through" : "none" }}>{item.name}</strong>
              </label>
              <span>{item.quantity} • {item.category}</span>
              <small>{item.estimated_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</small>
              <button className="danger-action" onClick={() => deleteItem(item.id)}><Trash2 size={16} /> Excluir</button>
            </article>
          ))}
        </aside>
      </section>
    </>
  );
}
