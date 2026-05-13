import { NextResponse } from "next/server";
import { localAssistantAnswer, senhorMeloKnowledge } from "@/lib/assistantKnowledge";

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
      max_tokens: 700,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = String(body.prompt || body.message || body.text || "").trim();

    if (!prompt) {
      return NextResponse.json({
        summary: "Digite uma pergunta ou pedido para o Senhor Melo.",
        answer: "Digite uma pergunta ou pedido para o Senhor Melo.",
        warnings: [],
      });
    }

    const groqAnswer = await askGroq(prompt);
    const answer = groqAnswer || localAssistantAnswer(prompt);

    return NextResponse.json({
      summary: answer,
      answer,
      warnings: groqAnswer ? [] : ["Resposta gerada pelo modo local do Senhor Melo."],
      raw: { provider: groqAnswer ? "groq" : "local" },
    });
  } catch (error) {
    const answer = "Não consegui processar agora. Tente novamente em instantes.";

    return NextResponse.json(
      {
        summary: answer,
        answer,
        warnings: [String(error)],
      },
      { status: 500 }
    );
  }
}
