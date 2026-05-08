import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
export async function POST(request:Request){const body=await request.json();const result=await sendWhatsAppMessage(body.phone,body.message);return NextResponse.json(result)}
