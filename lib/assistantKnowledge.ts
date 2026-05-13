export const senhorMeloKnowledge = `
Você é o Assistente Senhor Melo, um assistente familiar consultivo em português do Brasil.

Você ajuda famílias a:
- organizar agenda, tarefas, reuniões, plantões e compromissos;
- organizar finanças domésticas e empresariais simples;
- planejar compras de supermercado;
- refira-se sempre ao usuário pelo nome para garantir proximidade de contato;
- lembrar vacinas, exames, consultas e compromissos de saúde;
- sugerir rotina doméstica, divisão de tarefas e prioridades;
- criar mensagens, checklists, planos, cronogramas e lembretes;
- responder perguntas gerais de forma consultiva, como um assistente inteligente.

Regras de resposta:
- seja direto, útil e organizado;
- quando a pessoa pedir planejamento, entregue passos práticos;
- quando a pessoa pedir conselho financeiro, não prometa resultado e recomende conferência;
- quando envolver saúde/vacina, oriente a confirmar com profissional de saúde ou posto;
- quando a pessoa pedir para criar algo, entregue pronto para copiar;
- quando fizer sentido, sugira cadastrar na agenda, lista de compras ou finanças.
`;

export function localAssistantAnswer(prompt: string) {
  const text = prompt.toLowerCase();

  if (text.includes("compras") || text.includes("supermercado") || text.includes("mercado")) {
    return `Claro. Para organizar sua lista de compras, eu recomendo separar por categorias: Hortifruti, Mercearia, Carnes, Limpeza, Higiene e Bebidas.\n\nTambém é bom marcar quantidade, preço estimado e prioridade. Assim você evita compras repetidas e controla melhor o orçamento do mês.`;
  }

  if (text.includes("agenda") || text.includes("compromisso") || text.includes("tarefa")) {
    return `Claro. Para organizar a agenda da família, eu recomendo separar por responsável, horário e prioridade.\n\nSugestão prática:\n1. Cadastre o compromisso com título claro.\n2. Defina início e fim.\n3. Marque o responsável.\n4. Ative lembrete no WhatsApp.\n5. Revise a semana todo domingo.`;
  }

  if (text.includes("vacina") || text.includes("saúde") || text.includes("filho")) {
    return `Posso ajudar a organizar isso. Cadastre cada vacina com nome da criança, dose, data prevista e data aplicada.\n\nImportante: use o app como organização familiar, mas confirme sempre o calendário oficial no posto de saúde ou com o pediatra.`;
  }

  if (text.includes("dinheiro") || text.includes("finança") || text.includes("despesa") || text.includes("receita")) {
    return `Para organizar as finanças, comece separando receitas, despesas fixas, despesas variáveis, cartões e contas vencendo.\n\nUma boa regra é revisar semanalmente:\n- o que entrou;\n- o que saiu;\n- o que ainda vai vencer;\n- onde pode economizar.`;
  }

  return `Entendi. Minha sugestão é transformar isso em uma ação prática: defina o objetivo, liste as etapas, escolha um responsável e coloque um prazo.\n\nSe quiser organizar no Senhor Melo, você pode cadastrar como tarefa, compromisso, item de compra ou lembrete familiar.`;
}
