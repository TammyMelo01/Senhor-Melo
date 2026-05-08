export async function sendWhatsAppMessage(phone:string, message:string){
 const baseUrl = process.env.WHATSAPP_API_URL;
 const apiKey = process.env.WHATSAPP_API_TOKEN;
 const instance = process.env.WHATSAPP_INSTANCE || "senhor-melo";
 if(!baseUrl || !apiKey) return { ok:false, error:"WhatsApp API não configurada" };
 const response = await fetch(`${baseUrl}/message/sendText/${instance}`, {
  method:"POST", headers:{"Content-Type":"application/json", "apikey": apiKey},
  body: JSON.stringify({ number: phone, text: message })
 });
 const data = await response.json().catch(()=>({}));
 return { ok: response.ok, data };
}
