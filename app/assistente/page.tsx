"use client";

import { useState } from "react";
import { Bot, Loader2, SendHorizonal } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AssistentePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá 👋 Eu sou o Senhor Melo. Posso ajudar sua família com organização, rotina, compras, agenda, planejamento e dúvidas do dia a dia.",
    },
  ]);

  async function sendMessage() {
    if (!prompt.trim() || loading) return;

    const currentPrompt = prompt;

    setMessages((current) => [
      ...current,
      { role: "user", content: currentPrompt },
    ]);

    setPrompt("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.answer ||
            data.summary ||
            "Não consegui responder agora.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Estou com dificuldade para responder agora. Tente novamente em instantes.",
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <>
      <section className="hero-section">
        <span className="badge">Assistente inteligente</span>

        <h1>Eu te ajudo.</h1>

        <p className="lead">
          Pergunte qualquer coisa sobre organização, rotina, planejamento,
          compras, agenda, produtividade, finanças e dia a dia da família.
        </p>
      </section>

      <section className="panel-card">
        <div className="summary-list">
          {messages.map((message, index) => (
            <article key={index}>
              <Bot />
              <div>
                <strong>
                  {message.role === "assistant" ? "Senhor Melo" : "Você"}
                </strong>
                <span style={{ whiteSpace: "pre-wrap" }}>
                  {message.content}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
          <textarea
            placeholder="Ex: organize minha rotina da semana..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={5}
            style={{
              width: "100%",
              resize: "vertical",
              borderRadius: 22,
              padding: 18,
              border: "1px solid rgba(15, 23, 42, 0.12)",
              background: "#eef4ff",
              fontSize: 16,
              lineHeight: 1.5,
              outline: "none",
            }}
          />

          <button
            className="primary-action"
            onClick={sendMessage}
            disabled={loading}
            type="button"
          >
            {loading ? (
              <>
                <Loader2 size={18} />
                Pensando...
              </>
            ) : (
              <>
                <SendHorizonal size={18} />
                Eu te ajudo
              </>
            )}
          </button>
        </div>
      </section>
    </>
  );
}
