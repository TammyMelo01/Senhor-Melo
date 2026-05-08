export async function askGroq(prompt:string){
 const apiKey = process.env.GROQ_API_KEY;
 if(!apiKey) return { summary:"Configure GROQ_API_KEY na Vercel para ativar a IA.", warnings:["IA em modo demonstração."] };
 const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${apiKey}`},
  body: JSON.stringify({ model:"llama-3.3-70b-versatile", messages:[{role:"system",content:"Você é o Senhor Melo, assistente familiar."},{role:"user",content:prompt}], temperature:.3 })
 });
 const data = await response.json();
 return { summary: data?.choices?.[0]?.message?.content || "Sem resposta.", warnings: [] };
}
