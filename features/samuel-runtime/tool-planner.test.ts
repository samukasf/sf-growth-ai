import { describe, expect, it } from "vitest";

import { createToolPlanner, DEFAULT_TOOL_DETECTORS, ToolPlanner } from "./tool-planner";

describe("ToolPlanner", () => {
  it("seleciona a calculator para uma expressão aritmética com símbolo unicode (×)", () => {
    const plan = createToolPlanner().plan("Quanto é 856 × 347?");

    expect(plan).toEqual({
      selected: true,
      toolName: "calculator",
      input: { a: 856, operator: "*", b: 347 },
      reason: expect.stringContaining("856 × 347"),
    });
  });

  it("seleciona a calculator para operadores por extenso", () => {
    const plan = createToolPlanner().plan("Quanto é 20 dividido por 4?");

    expect(plan).toEqual({
      selected: true,
      toolName: "calculator",
      input: { a: 20, operator: "/", b: 4 },
      reason: expect.any(String),
    });
  });

  it("seleciona a date-time para perguntas sobre data/hora atual", () => {
    const plan = createToolPlanner().plan("Que horas são agora?");

    expect(plan).toEqual({
      selected: true,
      toolName: "date-time",
      input: { format: "readable" },
      reason: expect.any(String),
    });
  });

  it("seleciona a uuid para pedidos de identificador único", () => {
    const plan = createToolPlanner().plan("Gere um UUID para este registro.");

    expect(plan).toEqual({
      selected: true,
      toolName: "uuid",
      input: { count: 1 },
      reason: expect.any(String),
    });
  });

  it("seleciona a json-formatter quando há um trecho JSON na mensagem", () => {
    const plan = createToolPlanner().plan('Formate esse json: {"a":1,"b":2}');

    expect(plan).toEqual({
      selected: true,
      toolName: "json-formatter",
      input: { raw: '{"a":1,"b":2}' },
      reason: expect.any(String),
    });
  });

  it("não seleciona json-formatter quando pede para formatar mas não há JSON na mensagem", () => {
    const plan = createToolPlanner().plan("Formate esse json para mim, por favor.");

    expect(plan).toEqual({ selected: false });
  });

  it("devolve selected:false para perguntas de negócio comuns", () => {
    const planner = createToolPlanner();

    expect(planner.plan("Analise minha empresa")).toEqual({ selected: false });
    expect(planner.plan("Crie uma campanha para minha empresa.")).toEqual({ selected: false });
    expect(planner.plan("Explique SEO e aplique na minha empresa.")).toEqual({ selected: false });
    // "Analise meu faturamento." (sem "mês") não deve acionar a Supabase
    // Query Tool — continua sendo uma análise de negócio genérica, exatamente
    // como antes da Sprint 85.
    expect(planner.plan("Analise meu faturamento.")).toEqual({ selected: false });
  });

  it("seleciona a gmail (inbox_summary) para 'Responda meus e-mails.'", () => {
    const plan = createToolPlanner().plan("Responda meus e-mails.");

    expect(plan).toEqual({
      selected: true,
      toolName: "gmail",
      input: { actionId: "inbox_summary" },
      reason: expect.any(String),
    });
  });

  it("seleciona a gmail (search_messages) para 'Pesquise e-mails de cliente@empresa.com'", () => {
    const plan = createToolPlanner().plan("Pesquise e-mails de cliente@empresa.com");

    expect(plan).toEqual({
      selected: true,
      toolName: "gmail",
      input: { actionId: "search_messages", query: "in:inbox cliente@empresa.com" },
      reason: expect.any(String),
    });
  });

  it("seleciona a gmail (read_message) para 'Leia o e-mail mais recente'", () => {
    const plan = createToolPlanner().plan("Leia o e-mail mais recente");

    expect(plan).toEqual({
      selected: true,
      toolName: "gmail",
      input: { actionId: "read_message" },
      reason: expect.any(String),
    });
  });

  it("seleciona a gmail (reply_message) quando há corpo explícito na pergunta", () => {
    const plan = createToolPlanner().plan("Responda o e-mail com: Obrigado pela mensagem.");

    expect(plan).toEqual({
      selected: true,
      toolName: "gmail",
      input: { actionId: "reply_message", body: "Obrigado pela mensagem." },
      reason: expect.any(String),
    });
  });

  it("seleciona a gmail (inbox_summary) para 'Resuma minha caixa de entrada'", () => {
    const plan = createToolPlanner().plan("Resuma minha caixa de entrada");

    expect(plan).toEqual({
      selected: true,
      toolName: "gmail",
      input: { actionId: "inbox_summary" },
      reason: expect.any(String),
    });
  });

  it("seleciona a supabase-query (count_contacts) para 'Quantos clientes tenho?'", () => {
    const plan = createToolPlanner().plan("Quantos clientes tenho?");

    expect(plan).toEqual({
      selected: true,
      toolName: "supabase-query",
      input: { queryId: "count_contacts" },
      reason: expect.any(String),
    });
  });

  it("seleciona a supabase-query (list_inactive_contacts) para 'Quais empresas estão inativas?'", () => {
    const plan = createToolPlanner().plan("Quais empresas estão inativas?");

    expect(plan).toEqual({
      selected: true,
      toolName: "supabase-query",
      input: { queryId: "list_inactive_contacts" },
      reason: expect.any(String),
    });
  });

  it("seleciona a supabase-query (revenue_current_month) para 'Qual foi o faturamento deste mês?'", () => {
    const plan = createToolPlanner().plan("Qual foi o faturamento deste mês?");

    expect(plan).toEqual({
      selected: true,
      toolName: "supabase-query",
      input: { queryId: "revenue_current_month" },
      reason: expect.any(String),
    });
  });

  it("respeita a ordem de prioridade dos detectores injetados", () => {
    const alwaysCalculator = {
      toolName: "calculator",
      detect: () => ({ input: { a: 1, operator: "+" as const, b: 1 }, reason: "forçado" }),
    };
    const alwaysUuid = {
      toolName: "uuid",
      detect: () => ({ input: { count: 1 }, reason: "forçado" }),
    };

    const planner = new ToolPlanner([alwaysUuid, alwaysCalculator]);

    expect(planner.plan("qualquer coisa")).toEqual({
      selected: true,
      toolName: "uuid",
      input: { count: 1 },
      reason: "forçado",
    });
  });

  it("expõe exatamente os 9 detectores suportados por padrão (Sprint 79/80 + Supabase + Gmail + Calendar + Contacts + Drive)", () => {
    expect(DEFAULT_TOOL_DETECTORS.map((detector) => detector.toolName)).toEqual([
      "calculator",
      "date-time",
      "uuid",
      "json-formatter",
      "supabase-query",
      "gmail",
      "google-calendar",
      "google-contacts",
      "google-drive",
    ]);
  });

  it("seleciona google-calendar (calendar_today) para 'O que tenho hoje?'", () => {
    const plan = createToolPlanner().plan("O que tenho hoje?");

    expect(plan).toEqual({
      selected: true,
      toolName: "google-calendar",
      input: { actionId: "calendar_today" },
      reason: expect.any(String),
    });
  });

  it("seleciona google-calendar (calendar_week) para 'Minha agenda da semana'", () => {
    const plan = createToolPlanner().plan("Mostre minha agenda da semana");

    expect(plan).toEqual({
      selected: true,
      toolName: "google-calendar",
      input: { actionId: "calendar_week" },
      reason: expect.any(String),
    });
  });

  it("seleciona google-calendar (calendar_availability) para 'Tenho horário livre?'", () => {
    const plan = createToolPlanner().plan("Tenho horário livre?");

    expect(plan).toEqual({
      selected: true,
      toolName: "google-calendar",
      input: { actionId: "calendar_availability" },
      reason: expect.any(String),
    });
  });

  it("seleciona google-calendar (calendar_today dayOffset 1) para 'Tenho reunião amanhã?'", () => {
    const plan = createToolPlanner().plan("Tenho reunião amanhã?");

    expect(plan).toEqual({
      selected: true,
      toolName: "google-calendar",
      input: { actionId: "calendar_today", dayOffset: 1 },
      reason: expect.any(String),
    });
  });

  it("seleciona google-calendar (calendar_create) para 'Marque uma reunião'", () => {
    const plan = createToolPlanner().plan("Marque uma reunião");

    expect(plan).toMatchObject({
      selected: true,
      toolName: "google-calendar",
      input: {
        actionId: "calendar_create",
        title: expect.any(String),
        start: expect.any(String),
        end: expect.any(String),
      },
    });
  });

  it("seleciona google-contacts (contacts_phone) para 'Qual o telefone do João?'", () => {
    const plan = createToolPlanner().plan("Qual o telefone do João?");

    expect(plan).toEqual({
      selected: true,
      toolName: "google-contacts",
      input: { actionId: "contacts_phone", name: "João" },
      reason: expect.any(String),
    });
  });

  it("seleciona google-contacts (contacts_search) para 'Procure o contato da Maria.'", () => {
    const plan = createToolPlanner().plan("Procure o contato da Maria.");

    expect(plan).toEqual({
      selected: true,
      toolName: "google-contacts",
      input: { actionId: "contacts_search", query: "Maria", name: "Maria" },
      reason: expect.any(String),
    });
  });

  it("seleciona google-contacts (contacts_email) para 'Qual o e-mail do Carlos?'", () => {
    const plan = createToolPlanner().plan("Qual o e-mail do Carlos?");

    expect(plan).toEqual({
      selected: true,
      toolName: "google-contacts",
      input: { actionId: "contacts_email", name: "Carlos" },
      reason: expect.any(String),
    });
  });

  it("seleciona google-contacts (contacts_company) para 'Quem trabalha na empresa X?'", () => {
    const plan = createToolPlanner().plan("Quem trabalha na empresa X?");

    expect(plan).toEqual({
      selected: true,
      toolName: "google-contacts",
      input: { actionId: "contacts_company", company: "X" },
      reason: expect.any(String),
    });
  });

  it("seleciona google-contacts (contacts_birthdays) para aniversários do mês", () => {
    const plan = createToolPlanner().plan("Quais contatos fazem aniversário este mês?");

    expect(plan).toEqual({
      selected: true,
      toolName: "google-contacts",
      input: { actionId: "contacts_birthdays" },
      reason: expect.any(String),
    });
  });

  it("seleciona google-drive (drive_read_doc) para leitura de documento", () => {
    const plan = createToolPlanner().plan("Leia o documento Proposta Comercial no Drive.");

    expect(plan).toMatchObject({
      selected: true,
      toolName: "google-drive",
      input: { actionId: "drive_read_doc", name: "Proposta Comercial" },
    });
  });

  it("seleciona google-drive (drive_recent) para arquivos recentes", () => {
    const plan = createToolPlanner().plan("Quais os arquivos recentes do Google Drive?");

    expect(plan).toMatchObject({
      selected: true,
      toolName: "google-drive",
      input: { actionId: "drive_recent" },
    });
  });

  it("seleciona google-drive (drive_search) para busca no Drive", () => {
    const plan = createToolPlanner().plan("Pesquise no Google Drive por contrato.");

    expect(plan).toMatchObject({
      selected: true,
      toolName: "google-drive",
      input: { actionId: "drive_search", query: expect.any(String) },
    });
  });
});
