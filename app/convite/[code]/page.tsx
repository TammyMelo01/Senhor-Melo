"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { acceptInvite, FamilyInvite, getInvite } from "@/lib/familyStore";

export default function ConvitePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const [invite, setInvite] = useState<FamilyInvite | null>(null);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("Carregando convite...");

  useEffect(() => {
    getInvite(params.code).then((data) => {
      setInvite(data);
      setMessage(data ? "" : "Convite não encontrado ou expirado.");
    });
  }, [params.code]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    try {
      await acceptInvite({
        code: params.code,
        name,
        whatsapp: whatsapp.replace(/\D/g, ""),
        email,
      });
      router.push("/");
    } catch (error) {
      setMessage(String(error));
    }
  }

  return (
    <>
      <section className="auth-hero">
        <div className="auth-logo">SM</div>
        <h1>Você foi convidado.</h1>
        <p>Entre no ecossistema da {invite?.family_name || "família"} para compartilhar agenda, finanças, vacinas e lista de compras.</p>
      </section>

      <section className="auth-layout">
        <form className="auth-card" onSubmit={submit}>
          <h2>Aceitar convite</h2>
          {message && <p className="form-message">{message}</p>}

          <input placeholder="Seu nome completo" value={name} onChange={(event) => setName(event.target.value)} required />
          <input placeholder="Seu WhatsApp com DDI" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} required />
          <input placeholder="Seu e-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

          <button className="primary-action" type="submit" disabled={!invite}>
            <ShieldCheck size={18} /> Entrar na família
          </button>
        </form>
      </section>
    </>
  );
}
