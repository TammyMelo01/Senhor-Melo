"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Plus, ShieldCheck, Users } from "lucide-react";
import { createFamily, FamilyMemberInput } from "@/lib/familyStore";

export default function LoginPage() {
  const router = useRouter();
  const [familyName, setFamilyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerWhatsapp, setOwnerWhatsapp] = useState("");
  const [members, setMembers] = useState<FamilyMemberInput[]>([{ name: "", role: "Familiar", whatsapp: "" }]);
  const [inviteLinks, setInviteLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function addMemberLine() {
    setMembers([...members, { name: "", role: "Familiar", whatsapp: "" }]);
  }

  function updateMember(index: number, field: keyof FamilyMemberInput, value: string) {
    const next = [...members];
    next[index] = { ...next[index], [field]: value };
    setMembers(next);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const result = await createFamily({
      familyName,
      ownerName,
      ownerEmail,
      ownerWhatsapp: ownerWhatsapp.replace(/\D/g, ""),
      members,
    });

    const origin = window.location.origin;
    setInviteLinks(result.inviteLinks.map((code) => `${origin}/convite/${code}`));
    setLoading(false);
    if (result.inviteLinks.length === 0) router.push("/");
  }

  return (
    <>
      <section className="auth-hero">
        <div className="auth-logo">SM</div>
        <h1>Crie o ecossistema da sua família.</h1>
        <p>Cadastre a família, defina o responsável e gere convites para os demais membros entrarem no mesmo app.</p>
      </section>

      <section className="auth-layout">
        <form className="auth-card" onSubmit={submit}>
          <h2>Família principal</h2>

          <input placeholder="Nome da família. Ex: Família Melo" value={familyName} onChange={(event) => setFamilyName(event.target.value)} required />
          <input placeholder="Seu nome" value={ownerName} onChange={(event) => setOwnerName(event.target.value)} required />
          <input placeholder="Seu e-mail" type="email" value={ownerEmail} onChange={(event) => setOwnerEmail(event.target.value)} required />
          <input placeholder="Seu WhatsApp com DDI. Ex: 5585999999999" value={ownerWhatsapp} onChange={(event) => setOwnerWhatsapp(event.target.value)} required />

          <h2>Membros convidados</h2>

          {members.map((member, index) => (
            <div className="form-grid" key={index}>
              <input placeholder="Nome do membro" value={member.name} onChange={(event) => updateMember(index, "name", event.target.value)} />

              <select value={member.role} onChange={(event) => updateMember(index, "role", event.target.value)}>
                <option>Familiar</option>
                <option>Esposa</option>
                <option>Marido</option>
                <option>Filho</option>
                <option>Filha</option>
                <option>Avô/Avó</option>
                <option>Responsável financeiro</option>
              </select>

              <input placeholder="WhatsApp do membro opcional" value={member.whatsapp || ""} onChange={(event) => updateMember(index, "whatsapp", event.target.value)} />
            </div>
          ))}

          <button className="primary-action" type="button" onClick={addMemberLine}>
            <Plus size={18} /> Adicionar membro
          </button>

          <button className="primary-action" disabled={loading} type="submit">
            <ShieldCheck size={18} /> {loading ? "Criando..." : "Criar família e gerar convites"}
          </button>
        </form>

        <aside className="users-list-card">
          <h2>Links de convite</h2>
          {inviteLinks.length === 0 && <p>Depois de criar a família, os links dos convidados aparecem aqui.</p>}

          {inviteLinks.map((link) => (
            <article className="registered-user" key={link}>
              <strong>Convite familiar</strong>
              <p>{link}</p>
              <button className="primary-action small" onClick={() => navigator.clipboard.writeText(link)}>
                <Copy size={16} /> Copiar
              </button>
            </article>
          ))}

          {inviteLinks.length > 0 && (
            <button className="primary-action" onClick={() => router.push("/")}>
              <Users size={18} /> Ir para minha família
            </button>
          )}
        </aside>
      </section>
    </>
  );
}
