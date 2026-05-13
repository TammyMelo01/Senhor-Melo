"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CreditCard, Syringe, ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { DashboardCard } from "@/components/DashboardCard";
import { DashboardSummaryModal } from "@/components/DashboardSummaryModal";
import { FinanceModule } from "@/components/FinanceModule";
import { CalendarItem, Transaction } from "@/lib/types";
import { formatCurrency, getFinanceSummary } from "@/lib/finance";
import { initialCards, initialEvents, initialMembers, initialTransactions } from "@/lib/mockData";
import { deleteTransactionPersisted, loadEvents, loadTransactions, saveTransaction } from "@/lib/persistentStore";
import { getCurrentFamilyName, getFamilySession } from "@/lib/familySession";

export default function Home() {
  const [events, setEvents] = useState<CalendarItem[]>(initialEvents);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [familyName, setFamilyName] = useState("Família Melo");
  const [summaryType, setSummaryType] = useState<"events" | "income" | "expenses" | "bills" | null>(null);

  useEffect(() => {
    const session = getFamilySession();
    if (!session) {
      window.location.href = "/login";
      return;
    }

    setFamilyName(getCurrentFamilyName());
    loadEvents(initialEvents).then(setEvents);
    loadTransactions(initialTransactions).then(setTransactions);
  }, []);

  const summary = getFinanceSummary(transactions);

  async function addTransaction(item: Transaction) {
    setTransactions((current) => [item, ...current]);
    await saveTransaction(item);
  }

  async function updateTransaction(updated: Transaction) {
    setTransactions((current) => current.map((transaction) => (transaction.id === updated.id ? updated : transaction)));
    await saveTransaction(updated);
  }

  async function deleteTransaction(id: string) {
    setTransactions((current) => current.filter((transaction) => transaction.id !== id));
    await deleteTransactionPersisted(id);
  }

  return (
    <>
      <section className="hero-section">
        <span className="badge">Família • Agenda • Finanças • IA</span>
        <h1>Bom dia, {familyName}.</h1>
        <p className="lead">Resumo inteligente do dia, compromissos, tarefas, vacinas, compras e contas com lembretes pelo WhatsApp.</p>

        <div className="quick-grid">
          <Link className="primary-action" href="/agenda"><CalendarDays size={18} /> Agenda</Link>
          <Link className="primary-action" href="/vacinas"><Syringe size={18} /> Vacinas</Link>
          <Link className="primary-action" href="/compras"><ShoppingCart size={18} /> Lista de compras</Link>
        </div>
      </section>

      <section className="metrics-grid">
        <DashboardCard title="Próximos eventos" value={String(events.length)} subtitle="Hoje e próximos dias" icon={<CalendarDays />} tone="blue" onClick={() => setSummaryType("events")} />
        <DashboardCard title="Receitas" value={formatCurrency(summary.income)} subtitle="Total recebido no mês" icon={<TrendingUp />} tone="green" onClick={() => setSummaryType("income")} />
        <DashboardCard title="Despesas" value={formatCurrency(summary.expenses)} subtitle="Total gasto no mês" icon={<TrendingDown />} tone="red" onClick={() => setSummaryType("expenses")} />
        <DashboardCard title="Contas" value={String(summary.pendingBills.length)} subtitle="Com vencimento/alerta" icon={<CreditCard />} tone="yellow" onClick={() => setSummaryType("bills")} />
      </section>

      <section className="home-finance-only">
        <FinanceModule
          members={initialMembers}
          transactions={transactions}
          cards={initialCards}
          onAddTransaction={addTransaction}
          onUpdateTransaction={updateTransaction}
          onDeleteTransaction={deleteTransaction}
        />
      </section>

      <DashboardSummaryModal open={summaryType !== null} type={summaryType} events={events} transactions={transactions} onClose={() => setSummaryType(null)} />
    </>
  );
}
