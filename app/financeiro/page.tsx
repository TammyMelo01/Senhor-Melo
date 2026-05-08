"use client";
import { FinanceModule } from "@/components/FinanceModule";
import { initialCards, initialMembers, initialTransactions } from "@/lib/mockData";
import { Transaction } from "@/lib/types";
import { useState } from "react";
export default function FinanceiroPage(){const [transactions,setTransactions]=useState<Transaction[]>(initialTransactions);return <><section className="hero-section"><span className="badge">Controle financeiro familiar</span><h1>Finanças simples e inteligentes.</h1><p className="lead">Receitas, despesas, cartões, contas, vencimentos e lembretes via WhatsApp.</p></section><FinanceModule members={initialMembers} transactions={transactions} cards={initialCards} onAddTransaction={(item)=>setTransactions([item,...transactions])}/></>}
