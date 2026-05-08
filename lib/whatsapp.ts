export async function sendWhatsAppMessage(phone: string, message: string) {
  const baseUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_TOKEN;
  const instance = process.env.WHATSAPP_INSTANCE || "senhor-melo";

  if (!baseUrl || !apiKey) {
    return {
      ok: false,
      error: "Configure WHATSAPP_API_URL e WHATSAPP_API_TOKEN na Vercel.",
    };
  }

  const cleanPhone = phone.replace(/\D/g, "");

  const response = await fetch(`${baseUrl}/message/sendText/${instance}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify({
      number: cleanPhone,
      text: message,
    }),
  });

  const data = await response.json().catch(() => ({}));

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}
