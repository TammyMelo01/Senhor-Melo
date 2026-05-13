"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bot,
  CalendarDays,
  CreditCard,
  Home,
  Menu,
  Moon,
  Search,
  Settings,
  ShoppingCart,
  Syringe,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { getCurrentFamilyId } from "@/lib/familySession";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/agenda", label: "Agenda e tarefas", icon: CalendarDays },
  { href: "/vacinas", label: "Vacinas", icon: Syringe },
  { href: "/compras", label: "Lista de compras", icon: ShoppingCart },
  { href: "/financeiro", label: "Financeiro", icon: CreditCard },
  { href: "/membros", label: "Perfis da família", icon: UserRound },
  { href: "/assistente", label: "Assistente IA", icon: Bot },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();

    const query = search.trim();
    if (!query) return;

    const familyId = getCurrentFamilyId();
    router.push(`/busca?q=${encodeURIComponent(query)}&familyId=${encodeURIComponent(familyId)}`);
    setSearch("");
    setOpen(false);
  }

  return (
    <div className={`app-frame ${open ? "sidebar-open" : ""}`}>
      {open && <button className="sidebar-scrim" onClick={() => setOpen(false)} aria-label="Fechar menu" />}

      <aside className="sidebar">
        <button className="sidebar-close" onClick={() => setOpen(false)}>
          <X size={20} />
          Fechar
        </button>

        <div className="brand">
          <div className="brand-mark">SM</div>
          <div>
            <strong>Senhor Melo</strong>
            <span>Família • agenda • finanças</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <Icon size={22} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-section">
          <p>Calendários compartilhados</p>
          {["Família", "Plantões", "Escola", "Contas", "Vacinas", "Compras"].map((item) => (
            <label className="check-row" key={item}>
              <input type="checkbox" defaultChecked />
              {item}
            </label>
          ))}
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu />
          </button>

          <form className="top-search" onSubmit={submitSearch} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Search size={18} />
            <input
              aria-label="Pesquisar"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar eventos, contas, vacinas, compras..."
              style={{
                width: "100%",
                border: 0,
                outline: "none",
                background: "transparent",
                color: "inherit",
                minWidth: 0,
              }}
            />
          </form>

          <button className="icon-button" aria-label="Notificações">
            <Bell />
          </button>

          <button className="icon-button" aria-label="Tema">
            <Moon />
          </button>
        </header>

        {children}
      </section>
    </div>
  );
}

