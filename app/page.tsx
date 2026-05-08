"use client";

import { useState } from "react";
import { CalendarDays, CreditCard, TrendingDown, TrendingUp } from "lucide-react";
import { DashboardCard } from "@/components/DashboardCard";
import { DashboardSummaryModal } from "@/components/DashboardSummaryModal";
import { FinanceModule } from "@/components/FinanceModule";
import { CalendarItem, Transaction } from "@/lib/types";
import { formatCurrency, getFinanceSummary } from "@/lib/finance";
import { initialCards, initialEvents, initialMembers, initialTransactions } from "@/lib/mockData";

export default function Home() {
  const [events] = useState<CalendarItem[]>(initialEvents);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [summaryType, setSummaryType] = useState<"events" | "income" | "expenses" | "bills" | null>(null);
  const summary = getFinanceSummary(transactions);

  return (
    <>
      <section className="hero-section">
        <span className="badge">Família • Agenda • Finanças • IA</span>
        <h1>Bom dia, família Melo.</h1>
        <p className="lead">Resumo inteligente do dia, compromissos, tarefas e contas com lembretes pelo WhatsApp.</p>
        <button className="primary-action" onClick={() => setSummaryType("events")}>
          Organizar minha família com IA
        </button>
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
          onAddTransaction={(item) => setTransactions([item, ...transactions])}
        />
      </section>

      <DashboardSummaryModal
        open={summaryType !== null}
        type={summaryType}
        events={events}
        transactions={transactions}
        onClose={() => setSummaryType(null)}
      />
    </>
  );
}
