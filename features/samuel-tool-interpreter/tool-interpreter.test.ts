import { describe, expect, it } from "vitest";

import { buildToolInterpretationPrompt } from "./prompt-builder";
import { interpretToolResult, isToolInterpreterEnabled } from "./tool-interpreter";

import type { ToolInterpretationInput } from "./types";

const baseIntent = {
  category: "AUTOMATION" as const,
  confidence: 0.9,
  justification: "Pedido operacional sobre e-mails.",
};

function gmailInboxInput(overrides: Partial<ToolInterpretationInput> = {}): ToolInterpretationInput {
  return {
    toolName: "gmail",
    actionId: "inbox_summary",
    toolInput: { actionId: "inbox_summary" },
    toolOutput: {
      actionId: "inbox_summary",
      summary: "Inbox de empresa@gmail.com: 201 não lida(s), 10 mensagem(ns) recente(s).",
      data: {
        emailAddress: "empresa@gmail.com",
        unreadCount: 201,
        messages: [
          { subject: "Pintura Geral em Sintra", from: "zaask@mail.com", unread: true },
          { subject: "Alerta Google Empregos", from: "jobs@google.com", unread: true },
          { subject: "Cobrança CPF", from: "gov@mail.com", unread: false },
        ],
      },
    },
    intent: baseIntent,
    userQuery: "Resuma minha caixa de entrada.",
    ...overrides,
  };
}

describe("isToolInterpreterEnabled", () => {
  it("está habilitado por padrão", () => {
    const previous = process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
    delete process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
    expect(isToolInterpreterEnabled()).toBe(true);
    if (previous === undefined) delete process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
    else process.env.SAMUEL_TOOL_INTERPRETER_ENABLED = previous;
  });

  it("respeita SAMUEL_TOOL_INTERPRETER_ENABLED=false", () => {
    const previous = process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
    process.env.SAMUEL_TOOL_INTERPRETER_ENABLED = "false";
    expect(isToolInterpreterEnabled()).toBe(false);
    if (previous === undefined) delete process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
    else process.env.SAMUEL_TOOL_INTERPRETER_ENABLED = previous;
  });
});

describe("buildToolInterpretationPrompt", () => {
  it("instrui a IA a responder em linguagem natural", () => {
    const prompt = buildToolInterpretationPrompt("201 mensagens não lidas.", "Resuma minha caixa de entrada.");

    expect(prompt).toContain("201 mensagens não lidas.");
    expect(prompt).toContain("Resuma minha caixa de entrada.");
    expect(prompt).toContain("Nunca cite JSON");
    expect(prompt).toContain("responder naturalmente");
  });
});

describe("interpretToolResult — Gmail", () => {
  it("formata inbox_summary com assuntos em bullets, sem JSON", () => {
    const result = interpretToolResult(gmailInboxInput());

    expect(result).toMatchObject({
      enabled: true,
      used: true,
      toolName: "gmail",
      actionId: "inbox_summary",
    });
    expect(result.contextForAi).toContain("A Gmail Tool retornou:");
    expect(result.contextForAi).toContain("201 mensagem(ns) não lida(s)");
    expect(result.contextForAi).toContain("• Pintura Geral em Sintra");
    expect(result.contextForAi).toContain("• Alerta Google Empregos");
    expect(result.contextForAi).not.toContain('"actionId"');
    expect(result.humanFallback).toContain("Inbox de empresa@gmail.com");
  });

  it("formata search_messages com contagem e assuntos", () => {
    const result = interpretToolResult(
      gmailInboxInput({
        actionId: "search_messages",
        toolInput: { actionId: "search_messages", query: "in:inbox parceiro@empresa.com" },
        toolOutput: {
          actionId: "search_messages",
          summary: '1 e-mail(s) encontrado(s) para "in:inbox parceiro@empresa.com".',
          data: {
            query: "in:inbox parceiro@empresa.com",
            count: 1,
            messages: [{ subject: "Follow-up", from: "parceiro@empresa.com" }],
          },
        },
        userQuery: "Pesquise e-mails de parceiro@empresa.com",
      }),
    );

    expect(result.used).toBe(true);
    expect(result.contextForAi).toContain("1 e-mail(s) encontrado(s)");
    expect(result.contextForAi).toContain("• Follow-up");
    expect(result.humanFallback).toContain("1 e-mail(s) encontrado(s)");
  });
});

describe("interpretToolResult — Google Calendar", () => {
  it("formata calendar_today com bullets de horário, sem JSON", () => {
    const result = interpretToolResult({
      toolName: "google-calendar",
      actionId: "calendar_today",
      toolInput: { actionId: "calendar_today" },
      toolOutput: {
        actionId: "calendar_today",
        summary: "3 compromisso(s) para hoje.",
        data: {
          eventCount: 3,
          events: [
            { title: "Reunião Comercial", startLabel: "09:00", endLabel: "10:00" },
            { title: "Visita ao Cliente", startLabel: "14:00", endLabel: "15:00" },
            { title: "Academia", startLabel: "18:30", endLabel: "19:30" },
          ],
        },
      },
      intent: baseIntent,
      userQuery: "O que tenho hoje?",
    });

    expect(result.used).toBe(true);
    expect(result.contextForAi).toContain("Google Calendar Tool");
    expect(result.contextForAi).toContain("• 09:00 — Reunião Comercial");
    expect(result.contextForAi).toContain("• 14:00 — Visita ao Cliente");
    expect(result.contextForAi).not.toContain('"eventCount"');
    expect(result.humanFallback).toContain("Reunião Comercial");
  });

  it("formata calendar_availability com janelas livres", () => {
    const result = interpretToolResult({
      toolName: "google-calendar",
      actionId: "calendar_availability",
      toolOutput: {
        actionId: "calendar_availability",
        summary: "1 janela(s) livre(s) encontrada(s).",
        data: {
          eventCount: 2,
          freeSlots: [{ startLabel: "10:30", endLabel: "13:45" }],
        },
      },
      intent: baseIntent,
      userQuery: "Tenho horário livre?",
    });

    expect(result.contextForAi).toContain("Livre: 10:30 — 13:45");
  });
});

describe("interpretToolResult — Google Contacts", () => {
  it("formata contacts_phone sem JSON", () => {
    const result = interpretToolResult({
      toolName: "google-contacts",
      actionId: "contacts_phone",
      toolOutput: {
        actionId: "contacts_phone",
        summary: "Telefone de João Silva: +351 912 345 678.",
        data: {
          contactCount: 1,
          contacts: [{ name: "João Silva", phones: ["+351 912 345 678"], emails: [] }],
          phone: "+351 912 345 678",
        },
      },
      intent: baseIntent,
      userQuery: "Qual o telefone do João?",
    });

    expect(result.used).toBe(true);
    expect(result.contextForAi).toContain("Google Contacts Tool");
    expect(result.contextForAi).toContain("Telefone: +351 912 345 678");
    expect(result.contextForAi).not.toContain('"contactCount"');
  });
});

describe("interpretToolResult — Google Drive", () => {
  it("formata drive_read_doc com excerto de conteúdo sem JSON", () => {
    const result = interpretToolResult({
      toolName: "google-drive",
      actionId: "drive_read_doc",
      toolOutput: {
        actionId: "drive_read_doc",
        summary: 'Conteúdo do documento "Proposta" lido com sucesso.',
        data: {
          fileCount: 1,
          files: [{ name: "Proposta", mimeLabel: "Google Doc", modifiedLabel: "13/07/2026" }],
          content: "Crescimento previsto de 20% no trimestre.",
          hasContent: true,
        },
      },
      intent: baseIntent,
      userQuery: "Leia o documento Proposta.",
    });

    expect(result.used).toBe(true);
    expect(result.contextForAi).toContain("Google Drive Tool");
    expect(result.contextForAi).toContain("Crescimento previsto");
    expect(result.contextForAi).not.toContain('"fileCount"');
  });

  it("formata drive_download com PDF parseado sem JSON", () => {
    const result = interpretToolResult({
      toolName: "google-drive",
      actionId: "drive_download",
      toolOutput: {
        actionId: "drive_download",
        summary: 'Conteúdo extraído de "Relatorio.pdf".',
        data: {
          fileCount: 1,
          files: [{ name: "Relatorio.pdf", mimeLabel: "PDF", modifiedLabel: "13/07/2026" }],
          content: "Receita total: R$ 1.2M no trimestre.",
          hasContent: true,
          binaryParsed: true,
        },
      },
      intent: baseIntent,
      userQuery: "Extraia o conteúdo do PDF Relatorio.",
    });

    expect(result.used).toBe(true);
    expect(result.humanFallback).toContain("Receita total");
    expect(result.contextForAi).not.toContain('"binaryParsed"');
  });
});

describe("interpretToolResult — outras Tools", () => {
  it("formata supabase-query sem expor JSON", () => {
    const result = interpretToolResult({
      toolName: "supabase-query",
      actionId: "count_contacts",
      toolInput: { queryId: "count_contacts" },
      toolOutput: {
        queryId: "count_contacts",
        summary: "Você tem 12 cliente(s)/contato(s) registrados no CRM.",
        data: { total: 12 },
      },
      intent: baseIntent,
      userQuery: "Quantos clientes tenho?",
    });

    expect(result.used).toBe(true);
    expect(result.contextForAi).toContain("Supabase Query Tool");
    expect(result.contextForAi).toContain("12 cliente(s)");
    expect(result.contextForAi).not.toContain('"total"');
  });

  it("formata calculator", () => {
    const result = interpretToolResult({
      toolName: "calculator",
      toolInput: { a: 856, operator: "*", b: 347 },
      toolOutput: { result: 297032 },
      intent: baseIntent,
      userQuery: "Quanto é 856 × 347?",
    });

    expect(result.humanFallback).toBe("O resultado do cálculo é 297032.");
  });

  it("devolve used:false quando kill-switch desligado", () => {
    const previous = process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
    process.env.SAMUEL_TOOL_INTERPRETER_ENABLED = "false";

    const result = interpretToolResult(gmailInboxInput());

    expect(result).toEqual({ enabled: false, used: false });

    if (previous === undefined) delete process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
    else process.env.SAMUEL_TOOL_INTERPRETER_ENABLED = previous;
  });

  it("devolve used:false quando não há input", () => {
    expect(interpretToolResult(null)).toEqual({ enabled: true, used: false });
  });
});
