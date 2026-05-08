"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Phone, User, ShieldCheck } from "lucide-react";

type SavedUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  currency: string;
  language: string;
  timezone: string;
};

export default function MembrosPage() {
  const [users, setUsers] = useState<SavedUser[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Responsável",
    password: "",
    confirmPassword: "",
    currency: "BRL",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    consent: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("senhor-melo-users");
    if (saved) setUsers(JSON.parse(saved));
  }, []);

  function maskPhone(value: string) {
    const onlyNumbers = value.replace(/\D/g, "").slice(0, 13);

    if (onlyNumbers.length <= 2) return onlyNumbers;
    if (onlyNumbers.length <= 4) return `+${onlyNumbers.slice(0, 2)} ${onlyNumbers.slice(2)}`;
    if (onlyNumbers.length <= 9) return `+${onlyNumbers.slice(0, 2)} (${onlyNumbers.slice(2, 4)}) ${onlyNumbers.slice(4)}`;

    return `+${onlyNumbers.slice(0, 2)} (${onlyNumbers.slice(2, 4)}) ${onlyNumbers.slice(4, 9)}-${onlyNumbers.slice(9)}`;
  }

  function getPasswordStrength() {
    let score = 0;
    if (form.password.length >= 8) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/\d/.test(form.password)) score++;
    if (/[^A-Za-z0-9]/.test(form.password)) score++;

    if (!form.password) return "Digite uma senha";
    if (score <= 1) return "Senha fraca";
    if (score === 2 || score === 3) return "Senha média";
    return "Senha forte";
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setMessage("");

    if (!form.name.trim()) return setMessage("Informe o nome completo.");
    if (!form.email.includes("@")) return setMessage("Informe um e-mail válido.");
    if (form.phone.replace(/\D/g, "").length < 12) return setMessage("Informe o telefone com DDI e DDD. Ex: +55 11 99999-9999.");
    if (form.password.length < 6) return setMessage("A senha precisa ter pelo menos 6 caracteres.");
    if (form.password !== form.confirmPassword) return setMessage("As senhas não conferem.");
    if (!form.consent) return setMessage("Aceite os Termos de Uso e Política de Privacidade.");

    const newUser: SavedUser = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.replace(/\D/g, ""),
      role: form.role,
      currency: form.currency,
      language: form.language,
      timezone: form.timezone,
    };

    const nextUsers = [newUser, ...users];

    setUsers(nextUsers);
    localStorage.setItem("senhor-melo-users", JSON.stringify(nextUsers));

    setMessage("Usuário cadastrado. O número já pode receber notificações do bot.");

    await fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: newUser.phone,
        message: `✅ Senhor Melo\n\nOlá, ${newUser.name}! Seu perfil foi cadastrado e este WhatsApp receberá lembretes da agenda, tarefas e contas.`,
      }),
    }).catch(() => {});

    setForm({
      name: "",
      email: "",
      phone: "",
      role: "Responsável",
      password: "",
      confirmPassword: "",
      currency: "BRL",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      consent: false,
    });
  }

  return (
    <>
      <section className="auth-hero">
        <div className="auth-logo">SM</div>
        <h1>Crie seu perfil familiar.</h1>
        <p>Cadastre os membros da família para receber lembretes pelo WhatsApp, organizar agenda e separar finanças individuais.</p>
      </section>

      <section className="auth-layout">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Cadastro de usuário</h2>

          <label className="field-with-icon">
            <User size={18} />
            <input
              placeholder="Nome completo"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              autoComplete="name"
            />
          </label>

          <label className="field-with-icon">
            <Mail size={18} />
            <input
              placeholder="E-mail"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              autoComplete="email"
            />
          </label>

          <label className="field-with-icon">
            <Phone size={18} />
            <input
              placeholder="Telefone WhatsApp com DDI. Ex: +55 11 99999-9999"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: maskPhone(event.target.value) })}
              autoComplete="tel"
            />
          </label>

          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option>Responsável</option>
            <option>Esposa</option>
            <option>Filho</option>
            <option>Filha</option>
            <option>Familiar</option>
          </select>

          <div className="password-row">
            <input
              placeholder="Senha"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              autoComplete="new-password"
            />

            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <input
            placeholder="Confirmar senha"
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
            autoComplete="new-password"
          />

          <div className="password-strength">
            <span>{getPasswordStrength()}</span>
            <div className={`strength-bar ${getPasswordStrength().toLowerCase().replace(" ", "-")}`} />
          </div>

          <div className="two-cols">
            <select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}>
              <option value="BRL">Real brasileiro</option>
              <option value="USD">Dólar</option>
              <option value="EUR">Euro</option>
            </select>

            <select value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value })}>
              <option value="pt-BR">Português</option>
              <option value="en-US">Inglês</option>
              <option value="es">Espanhol</option>
            </select>
          </div>

          <select value={form.timezone} onChange={(event) => setForm({ ...form, timezone: event.target.value })}>
            <option value="America/Sao_Paulo">America/Sao_Paulo</option>
            <option value="America/Manaus">America/Manaus</option>
            <option value="America/Recife">America/Recife</option>
          </select>

          <label className="switch-row">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(event) => setForm({ ...form, consent: event.target.checked })}
            />
            Concordo com os Termos de Uso e Política de Privacidade
          </label>

          {message && <p className="form-message">{message}</p>}

          <button className="primary-action" type="submit">
            <ShieldCheck size={18} />
            Cadastrar
          </button>

          <div className="social-login">
            <button type="button">Entrar com Google</button>
            <button type="button">Entrar com Apple</button>
            <button type="button">Entrar com Microsoft</button>
          </div>
        </form>

        <aside className="users-list-card">
          <h2>Usuários cadastrados</h2>

          {users.length === 0 && <p>Nenhum usuário cadastrado ainda.</p>}

          {users.map((user) => (
            <article className="registered-user" key={user.id}>
              <div>
                <strong>{user.name}</strong>
                <span>{user.role}</span>
                <p>{user.email}</p>
                <small>WhatsApp: +{user.phone}</small>
              </div>
            </article>
          ))}
        </aside>
      </section>
    </>
  );
}
