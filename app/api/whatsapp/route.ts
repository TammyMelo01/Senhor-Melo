import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.phone || !body.message) {
      return NextResponse.json(
        { ok: false, error: "Informe phone e message." },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppMessage(body.phone, body.message);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Erro ao enviar WhatsApp." },
      { status: 500 }
    );
  }
}
