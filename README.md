# Senhor Melo v3.6 - Multi-família

Esta versão adiciona:
- Login/cadastro da família
- Sessão familiar local
- Convites por link
- Home dinâmica: "Bom dia, Família X"
- Módulo de vacinas dos filhos
- Módulo de lista de compras
- Endpoint base para Alexa
- AppShell com novas abas

## Arquivos criados/alterados

Substituir/criar:
- lib/familySession.ts
- lib/familyStore.ts
- lib/persistentStore.ts
- app/login/page.tsx
- app/convite/[code]/page.tsx
- app/page.tsx
- app/vacinas/page.tsx
- app/compras/page.tsx
- app/api/alexa/route.ts
- components/AppShell.tsx
- supabase-multifamilia.sql

## Importante

Este pacote NÃO altera `app/globals.css`.

## Supabase

Rode o arquivo `supabase-multifamilia.sql` no SQL Editor do Supabase.

## Depois

1. Suba os arquivos no GitHub
2. Faça commit
3. Faça deploy na Vercel
4. Abra `/login`
5. Crie a família principal
6. Copie os links de convite para os familiares

## Alexa

O endpoint base será:

https://SEU-DOMINIO.com/api/alexa

Para funcionar com Alexa real, ainda precisa criar uma Skill na Amazon Developer Console e apontar para esse endpoint.
