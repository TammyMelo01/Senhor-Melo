import { NextResponse } from "next/server";
import { askGroq } from "@/lib/groq";
export async function POST(request:Request){const body=await request.json();const result=await askGroq(body.input||"");return NextResponse.json(result)}
