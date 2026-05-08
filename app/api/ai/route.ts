import { NextResponse } from "next/server";
import { askGroq } from "@/lib/groq";

export async function POST(request: Request) {
  const body = await request.json();
  const input = body.input || "";

  if (!input.trim()) {
    return NextResponse.json({ summary: "Digite uma solicitação para o Senhor Melo organizar." });
  }

  const result = await askGroq(input);

  return NextResponse.json({
    summary:
      result?.summary ||
      result?.answer ||
      result?.message ||
      "Sugestão criada: revise a agenda, confirme responsáveis e ative lembretes por WhatsApp.",
    raw: result,
  });
}
