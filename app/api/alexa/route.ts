import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function getSlot(body: any, name: string) {
  return body?.request?.intent?.slots?.[name]?.value || "";
}

export async function POST(request: Request) {
  const body = await request.json();
  const intentName = body?.request?.intent?.name;
  const familyId = body?.session?.attributes?.familyId || "00000000-0000-0000-0000-000000000001";

  if (intentName === "AddShoppingItemIntent") {
    const item = getSlot(body, "item");
    const quantity = getSlot(body, "quantity") || "1";

    if (supabase && item) {
      await supabase.from("shopping_items").insert({
        id: crypto.randomUUID(),
        family_id: familyId,
        name: item,
        quantity,
        category: "Outros",
        estimated_price: 0,
        bought: false,
      });
    }

    return NextResponse.json({
      version: "1.0",
      response: {
        outputSpeech: { type: "PlainText", text: `${item} foi adicionado à lista de compras da família.` },
        shouldEndSession: true,
      },
    });
  }

  if (intentName === "AddCalendarEventIntent") {
    const title = getSlot(body, "title");
    const date = getSlot(body, "date");
    const time = getSlot(body, "time") || "08:00";

    if (supabase && title && date) {
      await supabase.from("calendar_items").insert({
        id: crypto.randomUUID(),
        family_id: familyId,
        title,
        type: "evento",
        date,
        start_time: time,
        end_time: time,
        color: "#2563eb",
        member_name: "Família",
        priority: "Média",
        whatsapp_reminder: true,
      });
    }

    return NextResponse.json({
      version: "1.0",
      response: {
        outputSpeech: { type: "PlainText", text: `${title} foi adicionado à agenda da família.` },
        shouldEndSession: true,
      },
    });
  }

  return NextResponse.json({
    version: "1.0",
    response: {
      outputSpeech: { type: "PlainText", text: "Senhor Melo está pronto." },
      shouldEndSession: true,
    },
  });
}
