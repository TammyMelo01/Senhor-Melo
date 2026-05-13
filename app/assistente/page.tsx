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

    const userMessage: Message = {
      role: "user",
      content: prompt,
    };

    setMessages((current) => [...current, userMessage]);
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content:
          data.answer ||
          data.summary ||
          "Não consegui responder agora.",
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Estou com dificuldade para responder agora. Tente novamente em instantes.",
        },
      ]);
    }

    setPrompt("");
    setLoading(false);
  }

  return (
    <>
      <section className="hero-section">
        <span className="badge">Assistente inteligente</span>

        <h1>Eu te ajudo.</h1>

        <p className="lead">
          Pergunte qualquer coisa sobre organização, rotina,
          planejamento, compras, agenda, produtividade,
          finanças e dia a dia da família.
        </p>
      </section>

      <section className="panel-card">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {messages.map((message, index) => (
            <article
              key={index}
              style={{
                alignSelf:
                  message.role === "user"
                    ? "flex-end"
                    : "flex-start",
                maxWidth: "85%",
                background:
                  message.role === "user"
                    ? "rgba(37,99,235,0.15)"
                    : "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "14px 16px",
                borderRadius: 18,
              }}
            >
              <strong
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                {message.role === "assistant" ? (
                  <>
                    <Bot size={16} />
                    Senhor Melo
                  </>
                ) : (
                  "Você"
                )}
              </strong>

              <p
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                }}
              >
                {message.content}
              </p>
            </article>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          <textarea
            placeholder="Ex: Como posso te ajudar hoje?..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
            style={{
              flex: 1,
              resize: "none",
            }}
          />

          <button
            className="primary-action"
            onClick={sendMessage}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <>
                <SendHorizonal size={18} />
                Enviar
              </>
            )}
          </button>
        </div>
      </section>
    </>
  );
}
