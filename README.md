# Correção Senhor Melo v3.5 - Persistência

Esta correção NÃO altera CSS.

Substitua/crie estes arquivos:
- lib/supabaseClient.ts
- lib/persistentStore.ts
- app/page.tsx
- app/agenda/page.tsx
- app/financeiro/page.tsx
- supabase-persistence.sql

## Supabase

1. Abra Supabase
2. Vá em SQL Editor
3. Cole o conteúdo de `supabase-persistence.sql`
4. Clique Run

## Vercel

Confira as variáveis:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Depois faça novo deploy.

Se o Supabase não estiver configurado, o app salva em localStorage.
Com Supabase configurado, salva no banco online.
