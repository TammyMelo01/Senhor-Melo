import { NextResponse } from "next/server";
import {
  buildHouseOrganizationPlan,
  formatPlan,
  localAssistantAnswer,
} from "@/lib/assistantKnowledge";
import { detectAssistantAction } from "@/lib/assistantActions";

function addDaysISOFrom(startDate: string, days: number) {
  const date = new Date(`${startDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

async function getSupabase() {
  try {
    const mod = await import("@/lib/supabaseClient");
    return mod.supabase || null;
  } catch {
    return null;
  }
}

function normalizeLineBreaks(text: string) {
  return text.replaceAll("\\n", "\n").replaceAll("\\t", "\t");
}

function findLastAssistantPlan(history: any[]) {
  const lastAssistantMessage = [...history]
    .reverse()
    .find((item: any) => item.role === "assistant" && /dia\s*1/i.test(String(item.content || "")));

  return lastAssistantMessage?.content ? normalizeLineBreaks(lastAssistantMessage.content) : "";
}

function buildContextualPrompt(prompt: string, history: any[]) {
  const lower = prompt.toLowerCase();

  const refersToPlan =
    lower.includes("esse plano") ||
    lower.includes("este plano") ||
    lower.includes("coloca esse plano") ||
    lower.includes("coloque esse plano") ||
    lower.includes("adiciona esse plano") ||
    lower.includes("adicione esse plano") ||
    lower.includes("minha agenda");

  if (!refersToPlan) return prompt;

  const lastPlan = findLastAssistantPlan(history);

  if (!lastPlan) return prompt;

  return `${lastPlan}\n\nPedido do usuário: ${prompt}`;
}

function tomorrowISO() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function extractStartDate(text: string) {
  const lower = text.toLowerCase();

  if (lower.includes("amanhã") || lower.includes("amanha")) return tomorrowISO();
  if (lower.includes("hoje")) return todayISO();

  const dateMatch = lower.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);

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

  return "";
}

function extractStartTime(text: string) {
  const lower = text.toLowerCase();

  const match = lower.match(/(?:às|as|horário|horario|começando|comecando|iniciar|começar|comecar|de)\s*(\d{1,2})(?::|h)?(\d{2})?/i);

  if (!match) return "";

  const hour = String(Math.min(Number(match[1]), 23)).padStart(2, "0");
  const minute = String(match[2] ? Number(match[2]) : 0).padStart(2, "0");

  return `${hour}:${minute}`;
}

function hasSchedule(text: string) {
  return Boolean(extractStartDate(text) && extractStartTime(text));
}

function nextHour(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const next = Math.min(hour + 1, 23);
  return `${String(next).padStart(2, "0")}:${String(minute || 0).padStart(2, "0")}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = String(body.prompt || "").trim();
    const familyId = body.familyId || "00000000-0000-0000-0000-000000000001";
    const history = Array.isArray(body.history) ? body.history : [];

    if (!prompt) {
      return NextResponse.json({
        answer: "Digite uma pergunta ou pedido para o Senhor Melo.",
        type: "answer",
        created: false,
      });
    }

    const contextualPrompt = buildContextualPrompt(prompt, history);
    const action = detectAssistantAction(contextualPrompt);
    const supabase = await getSupabase();

    if (action.type === "house_plan") {
      const days = Number(action.data?.days || 15);
      const plan = buildHouseOrganizationPlan(days);

      if (action.shouldCreate) {
        const startDate = extractStartDate(prompt);
        const startTime = extractStartTime(prompt);

        if (!startDate || !startTime) {
          return NextResponse.json({
            type: "house_plan",
            created: false,
            needsSchedule: true,
            answer:
              `## Antes de colocar na agenda\n\nEu consigo adicionar esse plano de **${days} dias** na agenda, mas preciso que você confirme:\n\n- **Qual data de início?**\n- **Qual horário de cada tarefa?**\n\nExemplo: **comece amanhã às 8h** ou **comece em 20/05 às 9h**.`,
          });
        }

        if (supabase) {
          for (const item of plan) {
            await supabase.from("calendar_items").insert({
              id: crypto.randomUUID(),
              family_id: familyId,
              title: item.title,
              type: "tarefa",
              date: addDaysISOFrom(startDate, item.day - 1),
              start_time: startTime,
              end_time: nextHour(startTime),
              color: "#2563eb",
              member_name: "Família",
              priority: "Média",
              description: item.task,
              whatsapp_reminder: true,
              microsteps: [],
            });
          }

          return NextResponse.json({
            type: "house_plan",
            created: true,
            answer:
              `## Plano adicionado à agenda\n\nPronto. Criei um plano de **${days} dias** na sua agenda, começando em **${startDate} às ${startTime}**.\n\n${formatPlan(plan)}`,
          });
        }

        return NextResponse.json({
          type: "house_plan",
          created: false,
          answer:
            `Eu entendi o plano e o horário, mas o banco não respondeu agora. Tente novamente em instantes.`,
        });
      }

      return NextResponse.json({
        type: "house_plan",
        created: false,
        answer:
          `## Plano de ${days} dias para organizar a casa\n\n${formatPlan(plan)}\n\n**Quer que eu coloque esse plano na agenda?**\n\nSe quiser, responda algo como: **coloque esse plano na minha agenda começando amanhã às 8h**.`,
      });
    }

    if (action.type === "shopping_item" && action.shouldCreate) {
      const items: string[] = action.data?.items || [];

      if (!items.length) {
        return NextResponse.json({
          type: "shopping_item",
          created: false,
          answer: "Me diga quais itens você quer adicionar na lista de compras.",
        });
      }

      if (supabase) {
        for (const item of items) {
          await supabase.from("shopping_items").insert({
            id: crypto.randomUUID(),
            family_id: familyId,
            name: item,
            quantity: "1",
            category: "Outros",
            estimated_price: 0,
            bought: false,
          });
        }
      }

      return NextResponse.json({
        type: "shopping_item",
        created: Boolean(supabase),
        answer: supabase
          ? `## Lista de compras atualizada\n\nAdicionei:\n\n${items.map((item) => `- ${item}`).join("\n")}`
          : `Entendi. Itens para adicionar:\n\n${items.map((item) => `- ${item}`).join("\n")}\n\nO banco não respondeu agora.`,
      });
    }

    if (action.type === "calendar_event" && action.shouldCreate) {
      const startDate = action.data.date;
      const startTime = action.data.start;

      if (!startDate || !startTime) {
        return NextResponse.json({
          type: "calendar_event",
          created: false,
          needsSchedule: true,
          answer:
            "Consigo adicionar esse compromisso, mas preciso da **data e horário**. Exemplo: **amanhã às 15h**.",
        });
      }

      if (supabase) {
        await supabase.from("calendar_items").insert({
          id: crypto.randomUUID(),
          family_id: familyId,
          title: action.data.title,
          type: action.data.type,
          date: startDate,
          start_time: startTime,
          end_time: action.data.end || nextHour(startTime),
          color: action.data.color,
          member_id: action.data.memberId,
          member_name: action.data.memberName,
          priority: action.data.priority,
          location: action.data.location,
          meeting_link: action.data.meetingLink,
          description: action.data.description,
          whatsapp_reminder: action.data.whatsappReminder,
          microsteps: action.data.microsteps,
        });
      }

      return NextResponse.json({
        type: "calendar_event",
        created: Boolean(supabase),
        answer: supabase
          ? `## Compromisso adicionado\n\nAdicionei **${action.data.title}** na agenda para **${startDate} às ${startTime}**.`
          : `Entendi. Eu montaria o compromisso **${action.data.title}** para **${startDate} às ${startTime}**, mas o banco não respondeu agora.`,
      });
    }

    if (action.type === "transaction" && action.shouldCreate) {
      if (!action.data?.value) {
        return NextResponse.json({
          type: "transaction",
          created: false,
          answer:
            "Consigo registrar, mas preciso que você informe o valor. Exemplo: **adicionar despesa de R$ 120 no mercado**.",
        });
      }

      if (supabase) {
        await supabase.from("transactions").insert({
          id: crypto.randomUUID(),
          family_id: familyId,
          kind: action.data.kind,
          value: action.data.value,
          category: action.data.category,
          account: action.data.account,
          member_name: "Família",
          description: action.data.description,
          due_date: action.data.dueDate,
          whatsapp_reminder: Boolean(action.data.whatsappReminder),
          paid: action.data.kind === "Receita",
        });
      }

      return NextResponse.json({
        type: "transaction",
        created: Boolean(supabase),
        answer: `## ${action.data.kind} registrada\n\nValor: **${Number(action.data.value).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}**\n\nCategoria: **${action.data.category}**.`,
      });
    }

    if (action.type === "vaccine_record" && action.shouldCreate) {
      if (supabase) {
        await supabase.from("vaccine_records").insert({
          id: crypto.randomUUID(),
          family_id: familyId,
          ...action.data,
        });
      }

      return NextResponse.json({
        type: "vaccine_record",
        created: Boolean(supabase),
        answer:
          "## Vacina cadastrada\n\nCadastrei essa vacina no cartão de vacinas.\n\n**Importante:** confirme sempre as datas com o posto de saúde ou pediatra.",
      });
    }

    return NextResponse.json({
      type: "answer",
      created: false,
      answer: localAssistantAnswer(prompt),
    });
  } catch (error) {
    return NextResponse.json({
      type: "answer",
      created: false,
      answer:
        "Consigo te ajudar, mas tive uma falha técnica agora. Tente novamente em instantes.",
      error: String(error),
    });
  }
}
