import { NextResponse } from "next/server";
import { askGroq } from "@/lib/groq";

function extractSummary(result: unknown): string {
  if (!result || typeof result !== "object") return "";

  const data = result as Record<string, unknown>;

  if (typeof data.summary === "string") return data.summary;
  if (typeof data.answer === "string") return data.answer;
  if (typeof data.message === "string") return data.message;

  return "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = typeof body.input === "string" ? body.input : "";

    if (!input.trim()) {
      return NextResponse.json({
        summary: "Digite uma solicitação para o Senhor Melo organizar.",
      });
    }

    const result = await askGroq(input);
    const summary = extractSummary(result);

    return NextResponse.json({
      summary:
        summary ||
        "Sugestão criada: revise a agenda, confirme responsáveis e ative lembretes por WhatsApp.",
      raw: result,
    });
  } catch {
    return NextResponse.json(
      {
        summary:
          "Não consegui processar a solicitação agora. Verifique a configuração da IA.",
      },
      { status: 500 }
    );
  }
}
