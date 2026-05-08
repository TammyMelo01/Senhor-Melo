export async function askGroq(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      summary:
        "IA em modo demonstração: configure GROQ_API_KEY na Vercel. Sugestão: criar evento com responsável, horário, microetapas e lembrete por WhatsApp.",
    };
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Você é o Senhor Melo, assistente familiar. Responda em português, com resumo curto, eventos sugeridos, tarefas, microetapas e lembretes WhatsApp.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      summary:
        data?.error?.message ||
        "A Groq retornou erro. Verifique se a GROQ_API_KEY está correta na Vercel.",
    };
  }

  return {
    summary: data?.choices?.[0]?.message?.content || "A IA não retornou conteúdo. Tente novamente.",
  };
}
