"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CreditCard as CardIcon,
  Edit3,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { categories } from "@/lib/mockData";
import { formatCurrency, getFinanceSummary } from "@/lib/finance";
import { CreditCard, Member, Transaction } from "@/lib/types";
import { Modal } from "./Modal";

type FormState = {
  id?: string;
  kind: string;
  value: string;
  category: string;
  account: string;
  memberId: string;
  description: string;
  dueDate: string;
  whatsappReminder: boolean;
  paid: boolean;
};

const emptyForm = (memberId: string): FormState => ({
  kind: "Receita",
  value: "",
  category: "Moradia",
  account: "Conta corrente",
  memberId,
  description: "",
  dueDate: "",
  whatsappReminder: true,
  paid: false,
});

export function FinanceModule({
  members,
  transactions,
  cards,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
}: {
  members: Member[];
  transactions: Transaction[];
  cards: CreditCard[];
  onAddTransaction: (transaction: Transaction) => void;
  onUpdateTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm(members[0]?.id || ""));

  const summary = useMemo(() => getFinanceSummary(transactions), [transactions]);

  const filteredTransactions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return transactions;

    return transactions.filter((transaction) => {
      const haystack = [
        transaction.description,
        transaction.category,
        transaction.account,
        transaction.kind,
        transaction.memberName,
        transaction.dueDate || "",
        String(transaction.value),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [transactions, query]);

  const expensesByCategory = useMemo(() => {
    const expenses = transactions.filter((item) => item.kind !== "Receita");
    const total = expenses.reduce((sum, item) => sum + item.value, 0) || 1;
    const grouped = expenses.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.value;
      return acc;
    }, {});

    const colors = ["#ef4444", "#f59e0b", "#2563eb", "#16a34a", "#8b5cf6", "#06b6d4"];

    return Object.entries(grouped).map(([category, value], index) => ({
      category,
      value,
      percent: Math.round((value / total) * 100),
      color: colors[index % colors.length],
    }));
  }, [transactions]);

  const month = new Date();
  month.setMonth(month.getMonth() + monthOffset);
  const monthName = month.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  function openCreate(kind?: string) {
    setForm({ ...emptyForm(members[0]?.id || ""), kind: kind || "Receita" });
    setModalOpen(true);
  }

  function openEdit(transaction: Transaction) {
    setForm({
      id: transaction.id,
      kind: transaction.kind,
      value: String(transaction.value),
      category: transaction.category,
      account: transaction.account,
      memberId: transaction.memberId,
      description: transaction.description,
      dueDate: transaction.dueDate || "",
      whatsappReminder: transaction.whatsappReminder,
      paid: transaction.paid,
    });
    setModalOpen(true);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = Number(form.value.replace(",", "."));
    if (!value || value <= 0) return;

    const member = members.find((item) => item.id === form.memberId) || members[0];

    const payload: Transaction = {
      id: form.id || crypto.randomUUID(),
      kind: form.kind as Transaction["kind"],
      value,
      category: form.category,
      account: form.account,
      memberId: form.memberId,
      memberName: member?.name || "Família",
      description: form.description || form.category,
      dueDate: form.dueDate || undefined,
      whatsappReminder: form.whatsappReminder,
      paid: form.paid,
    };

    if (form.id && onUpdateTransaction) onUpdateTransaction(payload);
    else onAddTransaction(payload);

    setModalOpen(false);
    setForm(emptyForm(members[0]?.id || ""));
  }

  function remove(id: string) {
    if (onDeleteTransaction) onDeleteTransaction(id);
    setDetailsOpen(false);
  }

  return (
    <section className="finance-module">
      <div className="finance-header">
        <button onClick={() => setMonthOffset(monthOffset - 1)}>‹</button>
        <strong>{monthName}</strong>
        <button onClick={() => setMonthOffset(monthOffset + 1)}>›</button>
      </div>

      <div className="days-strip">
        {Array.from({ length: 31 }, (_, index) => <span key={index}>{index + 1}</span>)}
      </div>

      <div className="calendar-search finance-search">
        <Search size={18} />
        <input
          placeholder="Buscar transações, contas, categorias ou cartões"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {query && <div className="search-results-label">{filteredTransactions.length} resultado(s) para “{query}”</div>}

      <div className="finance-overview">
        <button className="finance-card green" onClick={() => openCreate("Receita")}>
          <TrendingUp /><span>Receitas</span><strong>{formatCurrency(summary.income)}</strong>
        </button>
        <button className="finance-card red" onClick={() => openCreate("Despesa")}>
          <TrendingDown /><span>Despesas</span><strong>{formatCurrency(summary.expenses)}</strong>
        </button>
        <button className="finance-card yellow" onClick={() => openCreate("Despesa no cartão")}>
          <CardIcon /><span>Cartões</span><strong>{formatCurrency(cards.reduce((sum, card) => sum + card.used, 0))}</strong>
        </button>
        <button className="finance-card blue" onClick={() => openCreate("Transferência")}>
          <Wallet /><span>Saldo atual</span><strong>{formatCurrency(summary.balance)}</strong>
        </button>
      </div>

      <div className="pie-panel">
        <div>
          <h2>Despesas por categoria</h2>
          <p>Resumo visual do mês atual.</p>
        </div>
        <div
          className="pie-chart"
          style={{
            background: `conic-gradient(${expensesByCategory
              .map((item, index, array) => {
                const start = array.slice(0, index).reduce((sum, current) => sum + current.percent, 0);
                const end = start + item.percent;
                return `${item.color} ${start}% ${end}%`;
              })
              .join(", ")})`,
          }}
        />
        <div className="pie-legend">
          {expensesByCategory.map((item) => (
            <span key={item.category}><i style={{ background: item.color }} />{item.category}: {item.percent}%</span>
          ))}
        </div>
      </div>

      <div className="finance-section-head">
        <h2>Contas</h2>
        <button className="primary-action small" onClick={() => openCreate()}><Plus size={18} /> Adicionar</button>
      </div>

      <div className="transaction-list">
        <h2>Lançamentos e vencimentos</h2>

        {filteredTransactions.length === 0 && <p className="empty-list">Nenhum lançamento encontrado.</p>}

        {filteredTransactions.map((transaction) => (
          <article className="transaction-swipe" key={transaction.id}>
            <button className="swipe-action edit" onClick={() => openEdit(transaction)}><Edit3 size={18} />Editar</button>
            <button className="transaction-row" onClick={() => { setSelectedTransaction(transaction); setDetailsOpen(true); }}>
              <div>
                <strong>{transaction.description}</strong>
                <span>{transaction.category} • {transaction.memberName} • {transaction.account}</span>
                {transaction.dueDate && <small>Vence em {transaction.dueDate}</small>}
              </div>
              <div className="transaction-right">
                <strong className={transaction.kind === "Receita" ? "positive" : "negative"}>{formatCurrency(transaction.value)}</strong>
                {transaction.whatsappReminder && <small><Bell size={13} /> WhatsApp</small>}
              </div>
            </button>
            <button className="swipe-action delete" onClick={() => remove(transaction.id)}><Trash2 size={18} />Excluir</button>
          </article>
        ))}
      </div>

      <div className="cards-grid">
        <h2>Cartões de crédito</h2>
        {cards.map((card) => (
          <article className="credit-card" key={card.id} style={{ background: card.color }}>
            <strong>{card.name}</strong>
            <p>{formatCurrency(card.used)} / {formatCurrency(card.limit)}</p>
            <span>Fecha dia {card.closeDay} • vence dia {card.dueDay}</span>
          </article>
        ))}
      </div>

      <button className="floating-add" onClick={() => openCreate()}>+</button>

      <Modal title={form.id ? "Editar transação" : "Nova transação"} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid" onSubmit={submit}>
          <input inputMode="decimal" placeholder="Valor" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} />
          <select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}>
            <option>Receita</option><option>Despesa</option><option>Transferência</option><option>Despesa no cartão</option>
          </select>
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
          <select value={form.account} onChange={(event) => setForm({ ...form, account: event.target.value })}>
            <option>Conta corrente</option><option>Carteira</option><option>Poupança</option><option>Investimentos</option><option>Conta compartilhada</option><option>Cartão família</option>
          </select>
          <select value={form.memberId} onChange={(event) => setForm({ ...form, memberId: event.target.value })}>
            {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
          </select>
          <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
          <input placeholder="Descrição" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <label className="switch-row">
            <input type="checkbox" checked={form.whatsappReminder} onChange={(event) => setForm({ ...form, whatsappReminder: event.target.checked })} />
            Lembrar no WhatsApp
          </label>
          <button className="primary-action" type="submit">{form.id ? "Salvar alterações" : "Adicionar"}</button>
        </form>
      </Modal>

      <Modal title="Detalhes do lançamento" open={detailsOpen} onClose={() => setDetailsOpen(false)}>
        {selectedTransaction && (
          <div className="details-card">
            <h3>{selectedTransaction.description}</h3>
            <p><strong>Tipo:</strong> {selectedTransaction.kind}</p>
            <p><strong>Categoria:</strong> {selectedTransaction.category}</p>
            <p><strong>Conta:</strong> {selectedTransaction.account}</p>
            <p><strong>Membro:</strong> {selectedTransaction.memberName}</p>
            <p><strong>Valor:</strong> {formatCurrency(selectedTransaction.value)}</p>
            {selectedTransaction.dueDate && <p><strong>Vencimento:</strong> {selectedTransaction.dueDate}</p>}
            <p><strong>WhatsApp:</strong> {selectedTransaction.whatsappReminder ? "Ativo" : "Desativado"}</p>
            <div className="modal-actions">
              <button className="primary-action small" onClick={() => openEdit(selectedTransaction)}>Editar</button>
              <button className="danger-action" onClick={() => remove(selectedTransaction.id)}>Excluir</button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
