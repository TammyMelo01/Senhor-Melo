import { CalendarItem, CreditCard, Member, Transaction } from "./types";
const today = new Date().toISOString().slice(0,10);
export const initialMembers: Member[] = [
 { id:"m1", name:"Tammy", role:"Responsável", color:"#2563eb", whatsapp:"" },
 { id:"m2", name:"Esposa", role:"Plantões", color:"#16a34a", whatsapp:"" },
 { id:"m3", name:"Filho", role:"Escola e atividades", color:"#f59e0b", whatsapp:"" }
];
export const initialEvents: CalendarItem[] = [
 {id:"e1",title:"Plantão da esposa",type:"evento",date:today,start:"07:00",end:"09:00",color:"#16a34a",memberId:"m2",memberName:"Esposa",priority:"Alta",location:"Hospital",description:"Plantão cadastrado como exemplo",whatsappReminder:true,microsteps:["Conferir uniforme","Separar documentos","Sair com antecedência"]},
 {id:"e2",title:"Futebol do filho",type:"tarefa",date:today,start:"17:00",end:"18:00",color:"#f59e0b",memberId:"m3",memberName:"Filho",priority:"Média",location:"Escola",description:"Atividade escolar",whatsappReminder:true,microsteps:["Separar chuteira","Levar garrafa","Buscar no horário"]}
];
export const initialTransactions: Transaction[] = [
 {id:"t1",kind:"Receita",value:5400,category:"Salário",account:"Conta corrente",memberId:"m1",memberName:"Tammy",description:"Receita mensal",whatsappReminder:false,paid:true},
 {id:"t2",kind:"Despesa",value:420,category:"Internet",account:"Conta corrente",memberId:"m1",memberName:"Tammy",description:"Internet residencial",dueDate:today,whatsappReminder:true,paid:false},
 {id:"t3",kind:"Despesa",value:1090,category:"Mercado",account:"Conta compartilhada",memberId:"m1",memberName:"Família",description:"Compras do mês",whatsappReminder:false,paid:true}
];
export const initialCards: CreditCard[] = [{id:"c1",name:"Cartão família",limit:6000,used:1840,closeDay:20,dueDay:29,color:"#ef4444"}];
export const categories = ["Moradia","Energia","Água","Internet","Mercado","Escola","Saúde","Transporte","Lazer","Assinaturas","Cartão","Investimentos","Outros"];
