import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
export const metadata: Metadata = { title: "Senhor Melo", description: "Assistente familiar com agenda, tarefas, finanças e WhatsApp.", manifest: "/manifest.json", icons: { icon: "/icon.png", apple: "/icon.png" } };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><AppShell>{children}</AppShell></body></html>}
