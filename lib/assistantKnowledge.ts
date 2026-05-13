export const senhorMeloKnowledge = `
Você é o Assistente Senhor Melo, um assistente familiar consultivo em português do Brasil.

Você atua em dois modos:

1. Modo consultivo:
Responde perguntas gerais, ajuda a pensar, planejar, explicar e orientar.
Pode ajudar com rotina, casa, família, compras, organização, finanças, produtividade, estudos, tecnologia, alimentação, bem-estar e dúvidas gerais.

2. Modo ação:
Quando o usuário pedir para adicionar, criar, registrar, colocar, cadastrar, salvar ou montar algo no app, você deve ajudar a transformar isso em ação prática.

Você pode atuar sobre:
- Agenda e tarefas
- Cartão de vacinas
- Lista de compras
- Financeiro: receitas e despesas
- Planos de vários dias

Regras:
- Responda sempre em português do Brasil.
- Seja prático, claro e útil.
- Se for plano, entregue em dias numerados.
- Se for saúde ou medicamento, explique que não substitui médico/farmacêutico e recomende buscar atendimento se houver sintomas fortes.
- Se for finanças, dê orientação prática sem prometer resultado.
- Nunca diga apenas "cadastre no app" quando puder ajudar a estruturar.
`;

export function buildHouseOrganizationPlan(days = 15) {
  const tasks = [
    "Fazer uma vistoria geral da casa e listar tudo que precisa ser organizado.",
    "Separar roupas, calçados e objetos que não são mais usados.",
    "Organizar o quarto principal: cama, criados, cômoda e superfícies.",
    "Organizar guarda-roupa por categorias: trabalho, passeio, casa e doação.",
    "Organizar banheiro: descartar vencidos, limpar armários e separar produtos.",
    "Organizar cozinha: bancadas, pia, armários mais usados e utensílios duplicados.",
    "Organizar despensa: verificar validade, agrupar alimentos e montar lista de reposição.",
    "Organizar geladeira e freezer: limpar, descartar vencidos e separar por categorias.",
    "Organizar lavanderia: produtos de limpeza, panos, baldes e área de serviço.",
    "Organizar sala: controles, cabos, documentos soltos, decoração e eletrônicos.",
    "Organizar documentos: contas, garantias, exames, documentos pessoais e escola.",
    "Organizar quarto das crianças: brinquedos, roupas, material escolar e doações.",
    "Fazer limpeza mais pesada nos pontos críticos: janelas, portas, rodapés e cantos.",
    "Criar rotina simples de manutenção diária, semanal e mensal.",
    "Revisar tudo, finalizar pendências e deixar uma lista de compras/ajustes finais.",
  ];

  return tasks.slice(0, days).map((task, index) => ({
    day: index + 1,
    title: `Dia ${index + 1}: ${task}`,
    task,
  }));
}

export function formatPlan(plan: { day: number; title: string; task: string }[]) {
  return plan.map((item) => `${item.title}`).join("\\n");
}

export function localAssistantAnswer(prompt: string) {
  const text = prompt.toLowerCase();

  if (
    text.includes("plano") &&
    (text.includes("organizar a casa") || text.includes("arrumar a casa") || text.includes("férias") || text.includes("ferias"))
  ) {
    const match = text.match(/(\\d+)\\s*dias?/);
    const days = match ? Math.min(Number(match[1]), 30) : 15;
    const plan = buildHouseOrganizationPlan(days);

    return `Claro. Montei um plano de ${days} dias para organizar a casa:\\n\\n${formatPlan(plan)}\\n\\nSe quiser, eu também posso colocar esse plano na agenda.`;
  }

  if (text.includes("prednisolona") || text.includes("remédio") || text.includes("remedio") || text.includes("medicamento") || text.includes("dor") || text.includes("barriga")) {
    return `Posso te orientar de forma geral, mas isso não substitui um médico ou farmacêutico.\\n\\nDesconforto na barriga pode acontecer com alguns medicamentos, inclusive corticoides como a prednisolona, especialmente dependendo da dose, horário, alimentação e sensibilidade individual.\\n\\nO mais seguro é:\\n1. Não interromper nem alterar a dose sem orientação médica.\\n2. Verificar se foi recomendado tomar após alimentação.\\n3. Falar com o médico ou farmacêutico que indicou o remédio.\\n4. Procurar atendimento se houver dor forte, vômitos persistentes, sangue nas fezes, falta de ar, inchaço ou piora importante.`;
  }

  if (text.includes("compras") || text.includes("supermercado") || text.includes("mercado")) {
    return `Claro. Para organizar sua lista de compras, separe por categorias: Hortifruti, Mercearia, Carnes, Limpeza, Higiene e Bebidas.\\n\\nTambém ajuda marcar quantidade, preço estimado e prioridade para evitar compras repetidas e controlar melhor o orçamento.`;
  }

  if (text.includes("agenda") || text.includes("compromisso") || text.includes("tarefa")) {
    return `Claro. Para organizar a agenda da família, recomendo separar por responsável, horário e prioridade.\\n\\nUse este padrão:\\n1. Título claro.\\n2. Data e horário.\\n3. Responsável.\\n4. Lembrete no WhatsApp.\\n5. Revisão semanal.`;
  }

  if (text.includes("vacina") || text.includes("saúde") || text.includes("saude") || text.includes("filho")) {
    return `Posso ajudar a organizar isso. Cadastre cada vacina com nome da criança, dose, data prevista e data aplicada.\\n\\nImportante: use o app como apoio de organização, mas confirme sempre o calendário oficial no posto de saúde ou com o pediatra.`;
  }

  if (text.includes("dinheiro") || text.includes("finança") || text.includes("financa") || text.includes("despesa") || text.includes("receita")) {
    return `Para organizar as finanças, separe receitas, despesas fixas, despesas variáveis, cartões e contas vencendo.\\n\\nRevise semanalmente:\\n- o que entrou;\\n- o que saiu;\\n- o que ainda vai vencer;\\n- onde pode economizar.`;
  }

  return `Entendi. Vou te ajudar de forma prática.\\n\\nMinha sugestão é transformar isso em passos claros: defina o objetivo, liste as etapas, escolha um responsável e coloque um prazo. Se quiser, eu também posso transformar em tarefa, compromisso, item de compra ou registro financeiro dentro do Senhor Melo.`;
}

