import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { buildHouseOrganizationPlan, formatPlan, localAssistantAnswer, senhorMeloKnowledge } from "@/lib/assistantKnowledge";
import { detectAssistantAction } from "@/lib/assistantActions";

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function askGroq(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const messages: GroqMessage[] = [
    { role: "system", content: senhorMeloKnowledge },
    { role: "user", content: prompt },
  ];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.5,
      max_tokens: 900,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || null;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = String(body.prompt || "").trim();
    const familyId = body.familyId || "00000000-0000-0000-0000-000000000001";

    if (!prompt) {
      return NextResponse.json({
        answer: "Digite uma pergunta ou pedido para o Senhor Melo.",
        type: "answer",
        created: false,
      });
    }

    const action = detectAssistantAction(prompt);

    if (action.type === "house_plan") {
      const days = Number(action.data?.days || 15);
      const plan = buildHouseOrganizationPlan(days);

      if (action.shouldCreate && supabase) {
        for (const item of plan) {
          await supabase.from("calendar_items").insert({
            id: crypto.randomUUID(),
            family_id: familyId,
            title: item.title,
            type: "tarefa",
            date: addDaysISO(item.day - 1),
            start_time: "08:00",
            end_time: "09:00",
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
          answer: `Pronto. Criei um plano de ${days} dias e adicionei tudo na agenda:\\n\\n${formatPlan(plan)}`,
        });
      }

      return NextResponse.json({
        type: "house_plan",
        created: false,
        answer: `Claro. Montei um plano de ${days} dias para organizar a casa:\\n\\n${formatPlan(plan)}\\n\\nSe quiser, me diga: "coloque esse plano na agenda".`,
      });
    }

    if (action.type === "shopping_item" && action.shouldCreate) {
      const items: string[] = action.data?.items || [];

      if (items.length === 0) {
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
        created: true,
        answer: `Pronto. Adicionei na lista de compras: ${items.join(", ")}.`,
      });
    }

    if (action.type === "transaction" && action.shouldCreate) {
      if (!action.data?.value) {
        return NextResponse.json({
          type: "transaction",
          created: false,
          answer: "Consigo registrar, mas preciso que você informe o valor. Exemplo: adicionar despesa de R$ 120 no mercado.",
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
          due_date: action.data.dueDate || todayISO(),
          whatsapp_reminder: Boolean(action.data.whatsappReminder),
          paid: action.data.kind === "Receita",
        });
      }

      return NextResponse.json({
        type: "transaction",
        created: true,
        answer: `${action.data.kind} registrada: ${Number(action.data.value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} em ${action.data.category}.`,
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
        created: true,
        answer: "Pronto. Cadastrei essa vacina no cartão de vacinas. Confirme sempre as datas com o posto de saúde ou pediatra.",
      });
    }

    if (action.type === "calendar_event" && action.shouldCreate) {
      if (supabase) {
        await supabase.from("calendar_items").insert({
          id: crypto.randomUUID(),
          family_id: familyId,
          title: action.data.title,
          type: action.data.type,
          date: action.data.date,
          start_time: action.data.start,
          end_time: action.data.end,
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
        created: true,
        answer: `Pronto. Adicionei "${action.data.title}" na agenda para ${action.data.date}.`,
      });
    }

    const groqAnswer = await askGroq(prompt);
    const answer = groqAnswer || localAssistantAnswer(prompt);

    return NextResponse.json({
      type: "answer",
      created: false,
      answer,
      warnings: groqAnswer ? [] : ["Resposta gerada pelo modo local do Senhor Melo."],
    });
  } catch (error) {
    return NextResponse.json(
      {
        type: "error",
        created: false,
        answer: "Não consegui processar agora. Tente novamente em instantes.",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
