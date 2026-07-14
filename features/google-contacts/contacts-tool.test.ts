import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getGoogleContactsProviderForCompanyMock = vi.fn();

vi.mock("./google-contacts.provider", async (importOriginal) => {
  const original = await importOriginal<typeof import("./google-contacts.provider")>();
  return {
    ...original,
    getGoogleContactsProviderForCompany: getGoogleContactsProviderForCompanyMock,
  };
});

const { ContactsTool } = await import("./contacts-tool");

const VALID_COMPANY_ID = "dc8a6425-e184-4730-9b9d-df4e999e5b61";

function createProviderMock() {
  const joao = {
    resourceName: "people/joao",
    name: "João Silva",
    emails: ["joao@empresa.com"],
    phones: ["+351 912 345 678"],
    company: "Acme Labs",
    birthday: { month: 7, day: 15 },
  };
  const maria = {
    resourceName: "people/maria",
    name: "Maria Santos",
    emails: ["maria@empresa.com"],
    phones: ["+351 913 111 222"],
    company: "Acme Labs",
    birthday: { month: 7, day: 20 },
  };

  return {
    searchContacts: vi.fn().mockResolvedValue([joao, maria]),
    findContactByName: vi.fn().mockImplementation(async (name: string) => {
      if (/jo[aã]o/i.test(name)) return joao;
      if (/maria/i.test(name)) return maria;
      if (/carlos/i.test(name)) return { ...joao, name: "Carlos Lima", emails: ["carlos@empresa.com"], phones: [] };
      return null;
    }),
    findByCompany: vi.fn().mockResolvedValue([joao, maria]),
    getBirthdaysThisMonth: vi.fn().mockResolvedValue([joao, maria]),
    toContactSummary: vi.fn((contact: typeof joao) => ({
      id: contact.resourceName,
      name: contact.name,
      emails: contact.emails,
      phones: contact.phones,
      company: contact.company,
      birthdayLabel: contact.birthday ? "15/07" : undefined,
    })),
  };
}

let originalKillSwitch: string | undefined;

beforeEach(() => {
  originalKillSwitch = process.env.SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED;
  delete process.env.SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED;
  getGoogleContactsProviderForCompanyMock.mockReset();
  getGoogleContactsProviderForCompanyMock.mockResolvedValue(createProviderMock());
});

afterEach(() => {
  if (originalKillSwitch === undefined) delete process.env.SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED;
  else process.env.SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED = originalKillSwitch;
});

describe("ContactsTool", () => {
  const tool = new ContactsTool();

  it("busca contatos via contacts_search", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "contacts_search", query: "Maria" },
    });

    expect(result.summary).toContain('para "Maria"');
    expect(result.data.contactCount).toBe(2);
  });

  it("retorna e-mail via contacts_email", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "contacts_email", name: "Carlos" },
    });

    expect(result.summary).toContain("carlos@empresa.com");
    expect(result.data.contactCount).toBe(1);
  });

  it("retorna telefone via contacts_phone", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "contacts_phone", name: "João" },
    });

    expect(result.summary).toContain("+351 912 345 678");
    expect(result.data.phone).toBe("+351 912 345 678");
  });

  it("lista contatos por empresa via contacts_company", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "contacts_company", company: "Acme" },
    });

    expect(result.summary).toContain('na empresa "Acme"');
    expect(result.data.contactCount).toBe(2);
  });

  it("lista aniversários do mês via contacts_birthdays", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "contacts_birthdays" },
    });

    expect(result.summary).toContain("aniversário neste mês");
    expect(result.data.contactCount).toBe(2);
  });

  it("rejeita companyId inválido", async () => {
    await expect(
      tool.execute({
        organizationId: "org",
        companyId: "invalid",
        input: { actionId: "contacts_search", query: "João" },
      }),
    ).rejects.toThrow(/companyId ausente ou inválido/);
  });

  it("respeita kill-switch SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED=false", async () => {
    process.env.SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED = "false";

    await expect(
      tool.execute({
        organizationId: "org",
        companyId: VALID_COMPANY_ID,
        input: { actionId: "contacts_search", query: "João" },
      }),
    ).rejects.toThrow(/desabilitada/);
  });
});
