# Senhor Melo v3.9 - Markdown e contexto

Este pacote corrige:

- Respostas com `\n` aparecendo na tela
- Renderização básica de markdown
- Contexto para entender "esse plano"
- Ação: "coloque esse plano na minha agenda"

## Arquivos para substituir

- app/assistente/page.tsx
- app/api/assistant-action/route.ts
- lib/assistantActions.ts

## Não precisa instalar dependência

O markdown básico foi feito dentro do próprio componente.
Não precisa instalar `react-markdown`.

## Testes

1. Pergunte:
   Faça um plano de atividades pra arrumar a casa durante 15 dias que vou estar de férias

2. Depois pergunte:
   Consegue colocar esse plano na minha agenda?

Resultado esperado:
- texto formatado
- sem `\n`
- criação dos 15 itens na agenda
