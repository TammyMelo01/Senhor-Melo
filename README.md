# Senhor Melo v3.8 - Assistente com ações

Esta correção transforma o assistente em:
- Chat consultivo
- Criador de planos
- Agente que grava ações no app

## Arquivos para substituir/criar

- lib/assistantKnowledge.ts
- lib/assistantActions.ts
- app/api/assistant-action/route.ts
- app/api/ai/route.ts
- app/assistente/page.tsx

## Exemplos para testar

Perguntas gerais:
- Tô tomando prednisolona e tô com desconforto na barriga. É normal?
- Me ajuda a organizar minha semana.
- Como controlar melhor os gastos da família?

Planos:
- Faça um plano de 15 dias para organizar a casa nas férias.
- Crie um plano de 15 dias para organizar a casa e coloque na agenda.

Ações:
- Adicione consulta do filho amanhã às 15h na agenda.
- Adicionar arroz, leite e café na lista de compras.
- Adicionar despesa de R$ 120 no mercado.
- Adicionar receita de R$ 5400 de salário.
- Cadastre vacina BCG para meu filho amanhã.

## Importante

Não altera o globals.css.

