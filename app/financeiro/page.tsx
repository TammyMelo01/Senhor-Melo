"use client";

import { useState } from "react";
import { FinanceModule } from "@/components/FinanceModule";
import { Transaction } from "@/lib/types";
import { initialCards, initialMembers, initialTransactions } from "@/lib/mockData";

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  function updateTransaction(updated: Transaction) {
    setTransactions((current) => current.map((transaction) => (transaction.id === updated.id ? updated : transaction)));
  }

  function deleteTransaction(id: string) {
    setTransactions((current) => current.filter((transaction) => transaction.id !== id));
  }

  return (
    <>
      <section className="hero-section">
        <span className="badge">Controle financeiro familiar</span>
        <h1>Finanças simples e inteligentes.</h1>
        <p className="lead">Receitas, despesas, cartões, contas, vencimentos e lembretes via WhatsApp em uma experiência premium.</p>
      </section>

      <FinanceModule
        members={initialMembers}
        transactions={transactions}
        cards={initialCards}
        onAddTransaction={(item) => setTransactions([item, ...transactions])}
        onUpdateTransaction={updateTransaction}
        onDeleteTransaction={deleteTransaction}
      />
    </>
  );
}
