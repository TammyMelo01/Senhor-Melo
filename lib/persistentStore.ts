import { CalendarItem, Member, Transaction } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";

const FAMILY_ID = "senhor-melo-default-family";

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export async function ensureDefaultFamily() {
  if (!supabase) return;
  await supabase.from("families").upsert({
    id: FAMILY_ID,
    name: "Família Melo",
    updated_at: new Date().toISOString(),
  });
}

function memberFromDb(row: any): Member {
  return {
    id: row.id,
    name: row.name,
    role: row.role || "Familiar",
    color: row.color || "#2563eb",
    whatsapp: row.whatsapp || "",
  };
}

export async function loadMembers(fallback: Member[]) {
  if (!supabase) return readLocal<Member[]>("senhor-melo-members", fallback);
  await ensureDefaultFamily();

  const { data, error } = await supabase
    .from("family_members")
    .select("*")
    .eq("family_id", FAMILY_ID)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return readLocal<Member[]>("senhor-melo-members", fallback);
  }

  return data.map(memberFromDb);
}

export async function saveMember(member: Member) {
  const current = readLocal<Member[]>("senhor-melo-members", []);
  const next = [member, ...current.filter((item) => item.id !== member.id)];
  writeLocal("senhor-melo-members", next);

  if (!supabase) return member;
  await ensureDefaultFamily();

  await supabase.from("family_members").upsert({
    id: member.id,
    family_id: FAMILY_ID,
    name: member.name,
    role: member.role,
    color: member.color,
    whatsapp: member.whatsapp,
    updated_at: new Date().toISOString(),
  });

  return member;
}

function eventFromDb(row: any): CalendarItem {
  return {
    id: row.id,
    title: row.title,
    type: row.type || "evento",
    date: row.date,
    start: row.start_time || "08:00",
    end: row.end_time || "09:00",
    color: row.color || "#2563eb",
    memberId: row.member_id || "",
    memberName: row.member_name || "Família",
    priority: row.priority || "Média",
    location: row.location || "",
    meetingLink: row.meeting_link || "",
    description: row.description || "",
    whatsappReminder: Boolean(row.whatsapp_reminder),
    microsteps: Array.isArray(row.microsteps) ? row.microsteps : [],
  };
}

export async function loadEvents(fallback: CalendarItem[]) {
  if (!supabase) return readLocal<CalendarItem[]>("senhor-melo-events", fallback);
  await ensureDefaultFamily();

  const { data, error } = await supabase
    .from("calendar_items")
    .select("*")
    .eq("family_id", FAMILY_ID)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error || !data || data.length === 0) {
    return readLocal<CalendarItem[]>("senhor-melo-events", fallback);
  }

  return data.map(eventFromDb);
}

export async function saveEvent(item: CalendarItem) {
  const current = readLocal<CalendarItem[]>("senhor-melo-events", []);
  const next = [item, ...current.filter((event) => event.id !== item.id)];
  writeLocal("senhor-melo-events", next);

  if (!supabase) return item;
  await ensureDefaultFamily();

  await supabase.from("calendar_items").upsert({
    id: item.id,
    family_id: FAMILY_ID,
    title: item.title,
    type: item.type,
    date: item.date,
    start_time: item.start,
    end_time: item.end,
    color: item.color,
    member_id: item.memberId,
    member_name: item.memberName,
    priority: item.priority,
    location: item.location || "",
    meeting_link: item.meetingLink || "",
    description: item.description || "",
    whatsapp_reminder: item.whatsappReminder,
    microsteps: item.microsteps || [],
    updated_at: new Date().toISOString(),
  });

  return item;
}

function transactionFromDb(row: any): Transaction {
  return {
    id: row.id,
    kind: row.kind || "Despesa",
    value: Number(row.value || 0),
    category: row.category || "Outros",
    account: row.account || "Conta corrente",
    memberId: row.member_id || "",
    memberName: row.member_name || "Família",
    description: row.description || "",
    dueDate: row.due_date || undefined,
    whatsappReminder: Boolean(row.whatsapp_reminder),
    paid: Boolean(row.paid),
  };
}

export async function loadTransactions(fallback: Transaction[]) {
  if (!supabase) return readLocal<Transaction[]>("senhor-melo-transactions", fallback);
  await ensureDefaultFamily();

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("family_id", FAMILY_ID)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return readLocal<Transaction[]>("senhor-melo-transactions", fallback);
  }

  return data.map(transactionFromDb);
}

export async function saveTransaction(transaction: Transaction) {
  const current = readLocal<Transaction[]>("senhor-melo-transactions", []);
  const next = [
    transaction,
    ...current.filter((item) => item.id !== transaction.id),
  ];
  writeLocal("senhor-melo-transactions", next);

  if (!supabase) return transaction;
  await ensureDefaultFamily();

  await supabase.from("transactions").upsert({
    id: transaction.id,
    family_id: FAMILY_ID,
    kind: transaction.kind,
    value: transaction.value,
    category: transaction.category,
    account: transaction.account,
    member_id: transaction.memberId,
    member_name: transaction.memberName,
    description: transaction.description,
    due_date: transaction.dueDate || null,
    whatsapp_reminder: transaction.whatsappReminder,
    paid: transaction.paid,
    updated_at: new Date().toISOString(),
  });

  return transaction;
}

export async function deleteTransactionPersisted(id: string) {
  const current = readLocal<Transaction[]>("senhor-melo-transactions", []);
  writeLocal("senhor-melo-transactions", current.filter((item) => item.id !== id));

  if (!supabase) return;
  await supabase.from("transactions").delete().eq("id", id);
}
