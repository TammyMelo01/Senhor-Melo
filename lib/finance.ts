import { Transaction } from "./types";
export function getFinanceSummary(transactions: Transaction[]) {
 const income = transactions.filter(t => t.kind === "Receita").reduce((s,t)=>s+t.value,0);
 const expenses = transactions.filter(t => t.kind !== "Receita").reduce((s,t)=>s+t.value,0);
 const pendingBills = transactions.filter(t => t.dueDate && !t.paid);
 return { income, expenses, balance: income-expenses, pendingBills, savingsPercent: income ? Math.round(((income-expenses)/income)*100) : 0 };
}
export function formatCurrency(value:number){ return value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
