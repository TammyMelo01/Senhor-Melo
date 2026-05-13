# Senhor Melo v4.0 - Agenda editável e assistente com confirmação de data

Este pacote corrige:

1. O assistente não adiciona mais plano na agenda sem perguntar data e horário.
2. Se você pedir "coloque esse plano na minha agenda", ele pergunta:
   - data de início
   - horário
3. A agenda agora permite:
   - adicionar compromisso
   - editar compromisso
   - excluir compromisso
   - buscar compromissos

## Arquivos para substituir

- app/api/assistant-action/route.ts
- lib/assistantActions.ts
- lib/persistentStore.ts
- components/FamilyCalendar.tsx
- app/agenda/page.tsx

## Teste do assistente

1. Pergunte:
   Faça um plano de atividades pra arrumar a casa durante 15 dias que vou estar de férias

2. Depois pergunte:
   Coloque esse plano na minha agenda

Ele deve perguntar data e horário.

3. Responda:
   Comece amanhã às 8h

Ele deve criar as atividades com data e horário.

## Teste da agenda

Vá em /agenda e teste:
- adicionar
- editar
- excluir
