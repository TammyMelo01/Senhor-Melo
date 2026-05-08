"use client";

import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";

export function AssistantBox() {
  const [input, setInput] = useState("Minha esposa tem plantão hoje à noite e próximo domingo. Add na agenda.");
  const [answer, setAnswer] = useState("Digite algo e clique para organizar.");
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    setAnswer("Organizando com IA...");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();
      setAnswer(data.summary || data.answer || data.message || "A IA não retornou texto estruturado.");
    } catch {
      setAnswer("Não consegui chamar a IA. Confira a variável GROQ_API_KEY na Vercel.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="assistant-box">
      <div className="assistant-icon"><Bot /></div>
      <h2>Assistente Senhor Melo</h2>
      <textarea value={input} onChange={(event) => setInput(event.target.value)} />
      <button className="primary-action" onClick={ask} disabled={loading}>
        <Sparkles size={18} />
        {loading ? "Organizando..." : "Organizar com IA"}
      </button>
      <div className="ai-answer">{answer}</div>
    </section>
  );
}
