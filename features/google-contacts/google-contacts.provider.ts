import { resolveGmailAccessToken } from "@/integrations/gmail";

import type { ContactsProvider } from "./contacts-provider";
import {
  ContactsApiError,
  type ContactSummary,
  type GoogleContact,
} from "./types";

const PEOPLE_API_BASE = "https://people.googleapis.com/v1";
const DEFAULT_MAX_RESULTS = 25;
const PERSON_FIELDS =
  "names,emailAddresses,phoneNumbers,organizations,birthdays";
const READ_MASK = PERSON_FIELDS;

type GooglePerson = {
  resourceName?: string;
  names?: Array<{ displayName?: string; givenName?: string; familyName?: string }>;
  emailAddresses?: Array<{ value?: string }>;
  phoneNumbers?: Array<{ value?: string }>;
  organizations?: Array<{ name?: string }>;
  birthdays?: Array<{ date?: { month?: number; day?: number; year?: number } }>;
};

type SearchContactsResponse = {
  results?: Array<{ person?: GooglePerson }>;
};

type ConnectionsListResponse = {
  connections?: GooglePerson[];
  nextPageToken?: string;
};

function mapHttpError(status: number, body: string): never {
  if (status === 401) {
    throw new ContactsApiError(
      "AUTH_ERROR",
      "Token de acesso do Google expirado ou inválido — pode ser necessário reconectar a conta.",
      { status },
    );
  }
  if (status === 403) {
    throw new ContactsApiError(
      "AUTH_ERROR",
      "Permissões insuficientes para Google Contacts (verifique os scopes concedidos no OAuth).",
      { status },
    );
  }
  throw new ContactsApiError("UNKNOWN", `Erro na Google People API (status ${status}): ${body}`, {
    status,
  });
}

function parsePerson(person: GooglePerson): GoogleContact | null {
  if (!person.resourceName) return null;

  const name =
    person.names?.[0]?.displayName ??
    [person.names?.[0]?.givenName, person.names?.[0]?.familyName].filter(Boolean).join(" ") ??
    "(sem nome)";

  const birthday = person.birthdays?.[0]?.date;
  const parsedBirthday =
    birthday?.month && birthday?.day
      ? { month: birthday.month, day: birthday.day, year: birthday.year }
      : undefined;

  return {
    resourceName: person.resourceName,
    name,
    emails: (person.emailAddresses ?? []).map((entry) => entry.value).filter(Boolean) as string[],
    phones: (person.phoneNumbers ?? []).map((entry) => entry.value).filter(Boolean) as string[],
    company: person.organizations?.[0]?.name,
    birthday: parsedBirthday,
  };
}

function formatBirthdayLabel(birthday: GoogleContact["birthday"]): string | undefined {
  if (!birthday) return undefined;
  const parts = [
    String(birthday.day).padStart(2, "0"),
    String(birthday.month).padStart(2, "0"),
    birthday.year ? String(birthday.year) : undefined,
  ].filter(Boolean);
  return parts.join("/");
}

function normalizeSearchTerm(value: string): string {
  return value.trim().toLowerCase();
}

function contactMatchesName(contact: GoogleContact, name: string): boolean {
  const term = normalizeSearchTerm(name);
  return normalizeSearchTerm(contact.name).includes(term);
}

export class GoogleContactsProvider implements ContactsProvider {
  constructor(private readonly accessToken: string) {}

  private async request<T>(
    path: string,
    init?: { method?: string; body?: unknown; query?: Record<string, string | number | undefined> },
  ): Promise<T> {
    const url = new URL(`${PEOPLE_API_BASE}${path}`);
    if (init?.query) {
      for (const [key, value] of Object.entries(init.query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: init?.method ?? "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/json",
          ...(init?.body ? { "Content-Type": "application/json" } : {}),
        },
        body: init?.body ? JSON.stringify(init.body) : undefined,
        cache: "no-store",
      });
    } catch (error) {
      throw new ContactsApiError("NETWORK_ERROR", "Falha de rede ao consultar a Google People API.", {
        cause: error,
      });
    }

    if (!response.ok) {
      mapHttpError(response.status, await response.text());
    }

    return (await response.json()) as T;
  }

  toContactSummary(contact: GoogleContact): ContactSummary {
    return {
      id: contact.resourceName,
      name: contact.name,
      emails: contact.emails,
      phones: contact.phones,
      company: contact.company,
      birthdayLabel: formatBirthdayLabel(contact.birthday),
    };
  }

  async searchContacts(query: string, maxResults = DEFAULT_MAX_RESULTS): Promise<GoogleContact[]> {
    const response = await this.request<SearchContactsResponse>("/people:searchContacts", {
      query: {
        query,
        readMask: READ_MASK,
        pageSize: maxResults,
      },
    });

    return (response.results ?? [])
      .map((result) => (result.person ? parsePerson(result.person) : null))
      .filter((contact): contact is GoogleContact => Boolean(contact));
  }

  async listConnections(maxResults = 1000): Promise<GoogleContact[]> {
    const contacts: GoogleContact[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.request<ConnectionsListResponse>("/people/me/connections", {
        query: {
          personFields: PERSON_FIELDS,
          pageSize: Math.min(maxResults - contacts.length, 1000),
          pageToken,
        },
      });

      for (const person of response.connections ?? []) {
        const parsed = parsePerson(person);
        if (parsed) contacts.push(parsed);
        if (contacts.length >= maxResults) break;
      }

      pageToken = contacts.length < maxResults ? response.nextPageToken : undefined;
    } while (pageToken && contacts.length < maxResults);

    return contacts;
  }

  async findContactByName(name: string): Promise<GoogleContact | null> {
    const results = await this.searchContacts(name, 10);
    const exact = results.find((contact) => normalizeSearchTerm(contact.name) === normalizeSearchTerm(name));
    if (exact) return exact;

    const partial = results.find((contact) => contactMatchesName(contact, name));
    return partial ?? results[0] ?? null;
  }

  async findByCompany(company: string, maxResults = DEFAULT_MAX_RESULTS): Promise<GoogleContact[]> {
    const term = normalizeSearchTerm(company);
    const connections = await this.listConnections(1000);
    return connections
      .filter((contact) => normalizeSearchTerm(contact.company ?? "").includes(term))
      .slice(0, maxResults);
  }

  async getBirthdaysThisMonth(maxResults = DEFAULT_MAX_RESULTS): Promise<GoogleContact[]> {
    const month = new Date().getMonth() + 1;
    const connections = await this.listConnections(1000);
    return connections
      .filter((contact) => contact.birthday?.month === month)
      .slice(0, maxResults);
  }
}

/** Reutiliza OAuth/token refresh da Sprint 86 — sem duplicar implementação. */
export async function getGoogleContactsProviderForCompany(
  companyId: string,
): Promise<GoogleContactsProvider> {
  try {
    const accessToken = await resolveGmailAccessToken(companyId);
    return new GoogleContactsProvider(accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : "erro desconhecido";
    if (message.includes("Nenhuma conta Gmail conectada") || message.includes("NOT_CONNECTED")) {
      throw new ContactsApiError(
        "NOT_CONNECTED",
        `Nenhuma conta Google conectada para a empresa "${companyId}". Conecte em /debug/gmail-connect.`,
      );
    }
    if (message.includes("não configurada") || message.includes("NOT_CONFIGURED")) {
      throw new ContactsApiError("NOT_CONFIGURED", message);
    }
    throw new ContactsApiError("UNKNOWN", message, { cause: error });
  }
}

export function formatContactLine(contact: ContactSummary): string {
  const details: string[] = [];
  if (contact.phones[0]) details.push(contact.phones[0]);
  if (contact.emails[0]) details.push(contact.emails[0]);
  if (contact.company) details.push(contact.company);
  if (contact.birthdayLabel) details.push(`aniversário ${contact.birthdayLabel}`);
  const suffix = details.length > 0 ? ` — ${details.join(", ")}` : "";
  return `${contact.name}${suffix}`;
}
