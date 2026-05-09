import { NextResponse } from "next/server";
import { askGroq } from "@/lib/groq";

function fallbackSummary(input: string) {
  return [
    "Plano sugerido pelo Senhor Melo:",
    "",
    `1. Transformei sua solicitação em uma tarefa: “${input.slice(0, 120)}”.`,
    "2. Crie um evento na agenda com responsável, data e horário.",
    "3. Ative o lembrete por WhatsApp para o membro da família correto.",
    "4. Divida a atividade em microetapas simples: confirmar detalhes, separar itens necessários e executar no horário.",
    "",
    "Observação: a Groq retornou restrição de organização ou não está configurada. O app usou resposta local para não deixar a IA sem ação."
  ].join("\n");
}

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
      return NextResponse.json({ summary: "Digite uma solicitação para o Senhor Melo organizar." });
    }

    const result = await askGroq(input);
    const summary = extractSummary(result);

    if (
      !summary ||
      summary.toLowerCase().includes("organization has been restricted") ||
      summary.toLowerCase().includes("restricted") ||
      summary.toLowerCase().includes("support")
    ) {
      return NextResponse.json({ summary: fallbackSummary(input), raw: result });
    }

    return NextResponse.json({ summary, raw: result });
  } catch {
    return NextResponse.json({
      summary: "Não consegui acessar a IA externa agora. Usei o modo local: crie o evento, escolha o responsável, defina horário e ative o lembrete por WhatsApp."
    });
  }
}
