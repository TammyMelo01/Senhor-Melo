export type AssistantActionType =
  | "answer"
  | "calendar_event"
  | "vaccine_record"
  | "transaction"
  | "shopping_item"
  | "house_plan";

export type AssistantActionResult = {
  type: AssistantActionType;
  reply: string;
  data?: any;
  shouldCreate?: boolean;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowISO() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function extractMoney(text: string) {
  const match = text.match(/(?:r\\$\\s*)?(\\d{1,7})(?:[,.](\\d{2}))?/i);
  if (!match) return 0;

  const reais = Number(match[1]);
  const cents = match[2] ? Number(match[2]) / 100 : 0;

  return reais + cents;
}

function extractTime(text: string) {
  const match = text.match(/(?:às|as|para|de)\\s*(\\d{1,2})(?::|h)?(\\d{2})?/i);
  if (!match) return "08:00";

  const hour = String(Math.min(Number(match[1]), 23)).padStart(2, "0");
  const minute = String(match[2] ? Number(match[2]) : 0).padStart(2, "0");

  return `${hour}:${minute}`;
}

function extractDate(text: string) {
  const lower = text.toLowerCase();

  if (lower.includes("amanhã") || lower.includes("amanha")) return tomorrowISO();
  if (lower.includes("hoje")) return todayISO();

  const dateMatch = lower.match(/(\\d{1,2})[\\/\\-](\\d{1,2})(?:[\\/\\-](\\d{2,4}))?/);

  if (dateMatch) {
    const day = String(Number(dateMatch[1])).padStart(2, "0");
    const month = String(Number(dateMatch[2])).padStart(2, "0");
    const year = dateMatch[3]
      ? String(dateMatch[3]).length === 2
        ? `20${dateMatch[3]}`
        : dateMatch[3]
      : String(new Date().getFullYear());

    return `${year}-${month}-${day}`;
  }

  return todayISO();
}

function cleanTitle(text: string) {
  return text
    .replace(/adicionar|adicione|colocar|coloque|criar|crie|cadastrar|cadastre|marcar|marque|na agenda|agenda|compromisso|tarefa/gi, "")
    .replace(/amanhã|amanha|hoje|às|as|\\d{1,2}h\\d{0,2}|\\d{1,2}:\\d{2}/gi, "")
    .replace(/\\s+/g, " ")
    .trim();
}

function detectShoppingItems(text: string) {
  let clean = text
    .replace(/adicionar|adicione|colocar|coloque|incluir|inclua|na lista de compras|lista de compras|compras|supermercado/gi, "")
    .trim();

  clean = clean.replace(/\\.$/, "");

  return clean
    .split(/,| e /)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function detectAssistantAction(prompt: string): AssistantActionResult {
  const text = prompt.toLowerCase();

  const wantsCreate =
    /adicionar|adicione|colocar|coloque|criar|crie|cadastrar|cadastre|registrar|registre|salvar|salve|marcar|marque/i.test(prompt);

  const wantsPlan =
    text.includes("plano") &&
    (text.includes("organizar a casa") || text.includes("arrumar a casa") || text.includes("férias") || text.includes("ferias"));

  if (wantsPlan) {
    const match = text.match(/(\\d+)\\s*dias?/);
    const days = match ? Math.min(Number(match[1]), 30) : 15;
    const shouldCreate = text.includes("agenda") || text.includes("coloque") || text.includes("colocar") || text.includes("crie") || text.includes("criar");

    return {
      type: "house_plan",
      shouldCreate,
      data: { days },
      reply: shouldCreate
        ? `Vou criar um plano de ${days} dias e colocar na agenda.`
        : `Vou montar um plano de ${days} dias para você.`,
    };
  }

  if ((text.includes("lista") || text.includes("compras") || text.includes("supermercado")) && wantsCreate) {
    const items = detectShoppingItems(prompt);

    return {
      type: "shopping_item",
      shouldCreate: true,
      data: { items },
      reply: items.length
        ? `Pronto, vou adicionar ${items.join(", ")} na lista de compras.`
        : "Me diga quais itens você quer adicionar na lista de compras.",
    };
  }

  if ((text.includes("despesa") || text.includes("receita") || text.includes("gasto") || text.includes("paguei") || text.includes("recebi")) && wantsCreate) {
    const value = extractMoney(prompt);
    const kind = text.includes("receita") || text.includes("recebi") ? "Receita" : "Despesa";

    let category = "Outros";
    if (text.includes("mercado") || text.includes("supermercado")) category = "Mercado";
    if (text.includes("internet")) category = "Internet";
    if (text.includes("energia") || text.includes("luz")) category = "Energia";
    if (text.includes("água") || text.includes("agua")) category = "Água";
    if (text.includes("escola")) category = "Escola";
    if (text.includes("saúde") || text.includes("saude") || text.includes("farmácia") || text.includes("farmacia")) category = "Saúde";

    return {
      type: "transaction",
      shouldCreate: true,
      data: {
        kind,
        value,
        category,
        account: "Conta corrente",
        description: prompt,
        dueDate: extractDate(prompt),
        whatsappReminder: text.includes("lembrar") || text.includes("whatsapp"),
      },
      reply: value
        ? `Pronto, vou registrar ${kind.toLowerCase()} de ${value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`
        : `Vou registrar essa ${kind.toLowerCase()}, mas preciso que você informe o valor.`,
    };
  }

  if ((text.includes("vacina") || text.includes("dose")) && wantsCreate) {
    const title = cleanTitle(prompt) || "Vacina";

    return {
      type: "vaccine_record",
      shouldCreate: true,
      data: {
        child_name: text.includes("filho") ? "Filho" : "Criança",
        vaccine_name: title,
        dose: text.includes("segunda") || text.includes("2") ? "2ª dose" : text.includes("terceira") || text.includes("3") ? "3ª dose" : "Dose",
        expected_age: "",
        due_date: extractDate(prompt),
        applied_date: "",
        place: "",
        notes: prompt,
        whatsapp_reminder: true,
      },
      reply: `Pronto, vou cadastrar essa vacina no cartão.`,
    };
  }

  if ((text.includes("agenda") || text.includes("compromisso") || text.includes("consulta") || text.includes("reunião") || text.includes("reuniao") || text.includes("tarefa")) && wantsCreate) {
    const title = cleanTitle(prompt) || "Compromisso";
    const start = extractTime(prompt);

    return {
      type: "calendar_event",
      shouldCreate: true,
      data: {
        title,
        type: text.includes("tarefa") ? "tarefa" : "evento",
        date: extractDate(prompt),
        start,
        end: start,
        color: "#2563eb",
        memberId: "",
        memberName: "Família",
        priority: "Média",
        location: "",
        meetingLink: "",
        description: prompt,
        whatsappReminder: true,
        microsteps: [],
      },
      reply: `Pronto, vou adicionar "${title}" na agenda.`,
    };
  }

  return {
    type: "answer",
    shouldCreate: false,
    reply: "",
  };
}
