export const calendarViews = ["Dia","3 dias","Semana","Mês","Ano","Agenda"];
export function todayISO(){ return new Date().toISOString().slice(0,10); }
export function hoursOfDay(){ return Array.from({length:17},(_,i)=>`${String(i+6).padStart(2,"0")}:00`); }
export function monthLabel(date:Date){ return date.toLocaleString("pt-BR",{month:"long",year:"numeric"}); }
export function addMonths(date:Date, amount:number){ const next = new Date(date); next.setMonth(next.getMonth()+amount); return next; }
