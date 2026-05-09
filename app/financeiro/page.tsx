"use client";

import { useEffect, useState } from "react";
import { FinanceModule } from "@/components/FinanceModule";
import { Transaction } from "@/lib/types";
import { initialCards, initialMembers, initialTransactions } from "@/lib/mockData";
import { deleteTransactionPersisted, loadTransactions, saveTransaction } from "@/lib/persistentStore";

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  useEffect(() => {
    loadTransactions(initialTransactions).then(setTransactions);
  }, []);

  async function addTransaction(item: Transaction) {
    setTransactions((current) => [item, ...current]);
    await saveTransaction(item);
  }

  async function updateTransaction(updated: Transaction) {
    setTransactions((current) =>
      current.map((transaction) => (transaction.id === updated.id ? updated : transaction))
    );
    await saveTransaction(updated);
  }

  async function deleteTransaction(id: string) {
    setTransactions((current) => current.filter((transaction) => transaction.id !== id));
    await deleteTransactionPersisted(id);
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
        onAddTransaction={addTransaction}
        onUpdateTransaction={updateTransaction}
        onDeleteTransaction={deleteTransaction}
      />
    </>
  );
}
