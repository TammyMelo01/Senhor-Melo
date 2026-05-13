"use client";

import { useState } from "react";
import { Bot, Loader2, SendHorizonal } from "lucide-react";
import { getCurrentFamilyId } from "@/lib/familySession";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function MarkdownText({ content }: { content: string }) {
  const normalized = content
    .replaceAll("\\n", "\n")
    .replaceAll("\\t", "\t");

  const lines = normalized.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} style={{ margin: "10px 0 14px 20px", padding: 0 }}>
          {listItems.map((item, index) => (
            <li key={index} style={{ marginBottom: 8 }}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      listItems.push(trimmed.replace(/^[-•]\s*/, ""));
      return;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^\d+\.\s*/, ""));
      return;
    }

    flushList();

    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={index} style={{ margin: "18px 0 8px", color: "#0f172a", fontSize: 20 }}>
          <InlineMarkdown text={trimmed.replace("### ", "")} />
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={index} style={{ margin: "20px 0 10px", color: "#0f172a", fontSize: 24 }}>
          <InlineMarkdown text={trimmed.replace("## ", "")} />
        </h2>
      );
      return;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={index} style={{ margin: "20px 0 10px", color: "#0f172a", fontSize: 28 }}>
          <InlineMarkdown text={trimmed.replace("# ", "")} />
        </h1>
      );
      return;
    }

    elements.push(
      <p key={index} style={{ margin: "0 0 12px", lineHeight: 1.65 }}>
        <InlineMarkdown text={trimmed} />
      </p>
    );
  });

  flushList();

  return (
    <div style={{ color: "#64748b", fontSize: 16, lineHeight: 1.65 }}>
      {elements}
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} style={{ color: "#0f172a", fontWeight: 800 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export default function AssistentePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá 👋 Eu sou o Senhor Melo. Posso responder dúvidas, montar planos e também adicionar itens na agenda, vacinas, finanças e lista de compras.",
    },
  ]);

  async function sendMessage() {
    if (!prompt.trim() || loading) return;

    const currentPrompt = prompt;
    const currentHistory = [...messages];

    setMessages((current) => [
      ...current,
      { role: "user", content: currentPrompt },
    ]);

    setPrompt("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentPrompt,
          familyId: getCurrentFamilyId(),
          history: currentHistory,
        }),
      });

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer || "Não consegui responder agora.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Estou com dificuldade para responder agora. Tente novamente em instantes.",
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
          Pergunte qualquer coisa ou peça para eu adicionar compromissos, vacinas, receitas, despesas e itens na lista de compras.
        </p>
      </section>

      <section className="panel-card">
        <div className="summary-list">
          {messages.map((message, index) => (
            <article key={index}>
              <Bot />
              <div>
                <strong>{message.role === "assistant" ? "Senhor Melo" : "Você"}</strong>
                <MarkdownText content={message.content} />
              </div>
            </article>
          ))}
        </div>

        <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
          <textarea
            placeholder="Ex: faça um plano de 15 dias para organizar a casa nas férias..."
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

          <button className="primary-action" onClick={sendMessage} disabled={loading} type="button">
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

