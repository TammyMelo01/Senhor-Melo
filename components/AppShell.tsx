"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, CalendarDays, Home, Menu, Settings, Users, WalletCards, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

const nav = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/agenda", label: "Agenda e tarefas", icon: CalendarDays },
  { href: "/financeiro", label: "Financeiro", icon: WalletCards },
  { href: "/membros", label: "Perfis da família", icon: Users },
  { href: "/assistente", label: "Assistente IA", icon: Bot },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className={`app-frame ${open ? "sidebar-open" : ""}`}>
      {open && <button className="sidebar-scrim" onClick={() => setOpen(false)} aria-label="Fechar menu" />}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">SM</div>
          <div>
            <strong>Senhor Melo</strong>
            <span>Família • agenda • finanças</span>
          </div>
        </div>

        <button className="sidebar-close" onClick={() => setOpen(false)}>
          <X size={18} />
          Fechar
        </button>

        <nav className="sidebar-nav">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`} onClick={() => setOpen(false)}>
                <Icon size={21} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-section">
          <p>Calendários compartilhados</p>
          {["Família Melo", "Plantões", "Escola", "Contas", "Tarefas"].map((item) => (
            <label className="check-row" key={item}>
              <input type="checkbox" defaultChecked />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu />
          </button>
          <div className="top-search">Pesquisar eventos, contas, tarefas...</div>
          <button className="icon-button" aria-label="Notificações">🔔</button>
          <ThemeToggle />
        </header>
        {children}
      </main>
    </div>
  );
}
