export type Member = { id:string; name:string; role:string; color:string; whatsapp:string };
export type CalendarItem = {
  id:string; title:string; type:"evento"|"tarefa"|"reuniao"|"lembrete"|"meta"|"bloqueio";
  date:string; start:string; end:string; color:string; memberId:string; memberName:string;
  priority:"Alta"|"Média"|"Baixa"; location?:string; meetingLink?:string; description?:string;
  whatsappReminder:boolean; microsteps:string[];
};
export type Transaction = {
  id:string; kind:"Receita"|"Despesa"|"Transferência"|"Despesa no cartão"; value:number;
  category:string; account:string; memberId:string; memberName:string; description:string;
  dueDate?:string; whatsappReminder:boolean; paid:boolean;
};
export type CreditCard = { id:string; name:string; limit:number; used:number; closeDay:number; dueDay:number; color:string };
