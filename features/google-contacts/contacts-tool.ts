/**
 * Google Contacts Tool (Sprint 89) — acessa Google Contacts real da empresa
 * via Tool Orchestrator, reutilizando OAuth/token refresh da Sprint 86.
 */
import { ToolExecutionError } from "@/features/samuel-tool-orchestrator/tool-execution-error";
import type { Tool, ToolExecutionContext } from "@/features/samuel-tool-orchestrator/types";

import {
  formatContactLine,
  getGoogleContactsProviderForCompany,
} from "./google-contacts.provider";
import type {
  ContactSummary,
  ContactsActionId,
  ContactsToolInput,
  ContactsToolOutput,
} from "./types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_MAX_RESULTS = 25;

function isUuidLike(value: string | undefined): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function describeError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "erro desconhecido";
}

function wrapContactsError(error: unknown): never {
  throw new ToolExecutionError("google-contacts", describeError(error), error);
}

function isContactsToolEnabled(): boolean {
  return process.env.SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED !== "false";
}

function buildListOutput(
  actionId: ContactsActionId,
  label: string,
  contacts: ContactSummary[],
): ContactsToolOutput {
  const preview = contacts.map(formatContactLine).join("\n");
  return {
    actionId,
    summary:
      contacts.length > 0
        ? `${contacts.length} contato(s) ${label}.`
        : `Nenhum contato ${label}.`,
    data: {
      contactCount: contacts.length,
      contacts,
      preview,
    },
  };
}

const ACTION_HANDLERS: Record<
  ContactsActionId,
  (companyId: string, input: ContactsToolInput) => Promise<ContactsToolOutput>
> = {
  contacts_search: async (companyId, input) => {
    const query = input.query?.trim() || input.name?.trim();
    if (!query) {
      throw new ToolExecutionError("google-contacts", "Termo de busca ausente para contacts_search.");
    }
    const provider = await getGoogleContactsProviderForCompany(companyId);
    const contacts = (await provider.searchContacts(query, input.maxResults ?? DEFAULT_MAX_RESULTS)).map(
      (contact) => provider.toContactSummary(contact),
    );
    return buildListOutput("contacts_search", `encontrado(s) para "${query}"`, contacts);
  },
  contacts_email: async (companyId, input) => {
    const name = input.name?.trim();
    if (!name) {
      throw new ToolExecutionError("google-contacts", "Nome ausente para contacts_email.");
    }
    const provider = await getGoogleContactsProviderForCompany(companyId);
    const contact = await provider.findContactByName(name);
    if (!contact) {
      return {
        actionId: "contacts_email",
        summary: `Nenhum contato encontrado para "${name}".`,
        data: { contactCount: 0, contacts: [], preview: "" },
      };
    }
    const summary = provider.toContactSummary(contact);
    const email = summary.emails[0];
    return {
      actionId: "contacts_email",
      summary: email
        ? `E-mail de ${summary.name}: ${email}.`
        : `${summary.name} não possui e-mail cadastrado.`,
      data: {
        contactCount: 1,
        contacts: [summary],
        email: email ?? null,
        preview: email ? `${summary.name}: ${email}` : summary.name,
      },
    };
  },
  contacts_phone: async (companyId, input) => {
    const name = input.name?.trim();
    if (!name) {
      throw new ToolExecutionError("google-contacts", "Nome ausente para contacts_phone.");
    }
    const provider = await getGoogleContactsProviderForCompany(companyId);
    const contact = await provider.findContactByName(name);
    if (!contact) {
      return {
        actionId: "contacts_phone",
        summary: `Nenhum contato encontrado para "${name}".`,
        data: { contactCount: 0, contacts: [], preview: "" },
      };
    }
    const summary = provider.toContactSummary(contact);
    const phone = summary.phones[0];
    return {
      actionId: "contacts_phone",
      summary: phone
        ? `Telefone de ${summary.name}: ${phone}.`
        : `${summary.name} não possui telefone cadastrado.`,
      data: {
        contactCount: 1,
        contacts: [summary],
        phone: phone ?? null,
        preview: phone ? `${summary.name}: ${phone}` : summary.name,
      },
    };
  },
  contacts_company: async (companyId, input) => {
    const company = input.company?.trim();
    if (!company) {
      throw new ToolExecutionError("google-contacts", "Empresa ausente para contacts_company.");
    }
    const provider = await getGoogleContactsProviderForCompany(companyId);
    const contacts = (await provider.findByCompany(company, input.maxResults ?? DEFAULT_MAX_RESULTS)).map(
      (contact) => provider.toContactSummary(contact),
    );
    return buildListOutput("contacts_company", `na empresa "${company}"`, contacts);
  },
  contacts_birthdays: async (companyId, input) => {
    const provider = await getGoogleContactsProviderForCompany(companyId);
    const contacts = (await provider.getBirthdaysThisMonth(input.maxResults ?? DEFAULT_MAX_RESULTS)).map(
      (contact) => provider.toContactSummary(contact),
    );
    return buildListOutput("contacts_birthdays", "com aniversário neste mês", contacts);
  },
};

export class ContactsTool implements Tool<ContactsToolInput, ContactsToolOutput> {
  readonly name = "google-contacts";
  readonly description =
    "Acessa o Google Contacts real da empresa: buscar contatos, e-mail, telefone, empresa e aniversários.";
  readonly inputSchema = {
    actionId:
      "'contacts_search' | 'contacts_email' | 'contacts_phone' | 'contacts_company' | 'contacts_birthdays'",
    name: "string (contacts_search, contacts_email, contacts_phone)",
    query: "string (contacts_search)",
    company: "string (contacts_company)",
    maxResults: "number (opcional)",
  };

  async execute(context: ToolExecutionContext<ContactsToolInput>): Promise<ContactsToolOutput> {
    if (!isContactsToolEnabled()) {
      throw new ToolExecutionError(
        this.name,
        "Google Contacts Tool está desabilitada (SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED=false).",
      );
    }

    const { actionId } = context.input;
    const handler = ACTION_HANDLERS[actionId];
    if (!handler) {
      throw new ToolExecutionError(
        this.name,
        `actionId desconhecido ou não autorizado: "${actionId}".`,
      );
    }

    if (!isUuidLike(context.companyId)) {
      throw new ToolExecutionError(
        this.name,
        `companyId ausente ou inválido — não é possível acessar contatos para "${context.companyId ?? "undefined"}".`,
      );
    }

    try {
      return await handler(context.companyId, context.input);
    } catch (error) {
      if (error instanceof ToolExecutionError) throw error;
      wrapContactsError(error);
    }
  }
}
