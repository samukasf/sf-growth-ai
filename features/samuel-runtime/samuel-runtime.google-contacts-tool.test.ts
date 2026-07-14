import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: fromMock },
}));

const getGoogleContactsProviderForCompanyMock = vi.fn();
vi.mock("@/features/google-contacts/google-contacts.provider", () => ({
  getGoogleContactsProviderForCompany: getGoogleContactsProviderForCompanyMock,
  formatContactLine: (contact: { name: string; phones?: string[] }) =>
    contact.phones?.[0] ? `${contact.name}: ${contact.phones[0]}` : contact.name,
}));

const generateNarrativeViaAIGatewayMock = vi.fn();
vi.mock("./ai-gateway-narrative.adapter", () => ({
  generateNarrativeViaAIGateway: generateNarrativeViaAIGatewayMock,
}));

const { runSamuelRuntime } = await import("./samuel-runtime.service");

const VALID_COMPANY_ID = "dc8a6425-e184-4730-9b9d-df4e999e5b61";

function createProviderMock() {
  return {
    searchContacts: vi.fn(),
    findContactByName: vi.fn().mockResolvedValue({
      resourceName: "people/joao",
      name: "João Silva",
      emails: ["joao@empresa.com"],
      phones: ["+351 912 345 678"],
      company: "Acme Labs",
    }),
    findByCompany: vi.fn(),
    getBirthdaysThisMonth: vi.fn(),
    toContactSummary: vi.fn(() => ({
      id: "people/joao",
      name: "João Silva",
      emails: ["joao@empresa.com"],
      phones: ["+351 912 345 678"],
      company: "Acme Labs",
    })),
  };
}

let originalToolCallingKillSwitch: string | undefined;
let originalContactsKillSwitch: string | undefined;
let originalInterpreterKillSwitch: string | undefined;
let originalConversationMemoryKillSwitch: string | undefined;

beforeEach(() => {
  originalToolCallingKillSwitch = process.env.SAMUEL_TOOL_CALLING_ENABLED;
  originalContactsKillSwitch = process.env.SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED;
  originalInterpreterKillSwitch = process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
  originalConversationMemoryKillSwitch = process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED;
  delete process.env.SAMUEL_TOOL_CALLING_ENABLED;
  delete process.env.SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED;
  delete process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
  process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED = "false";
  fromMock.mockReset();
  getGoogleContactsProviderForCompanyMock.mockReset();
  getGoogleContactsProviderForCompanyMock.mockResolvedValue(createProviderMock());
  generateNarrativeViaAIGatewayMock.mockReset().mockResolvedValue({
    narrative: "O telefone de João Silva é +351 912 345 678.",
    metadata: { used: true },
  });
});

afterEach(() => {
  if (originalToolCallingKillSwitch === undefined) delete process.env.SAMUEL_TOOL_CALLING_ENABLED;
  else process.env.SAMUEL_TOOL_CALLING_ENABLED = originalToolCallingKillSwitch;
  if (originalContactsKillSwitch === undefined) delete process.env.SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED;
  else process.env.SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED = originalContactsKillSwitch;
  if (originalInterpreterKillSwitch === undefined) delete process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
  else process.env.SAMUEL_TOOL_INTERPRETER_ENABLED = originalInterpreterKillSwitch;
  if (originalConversationMemoryKillSwitch === undefined) delete process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED;
  else process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED = originalConversationMemoryKillSwitch;
});

describe("runSamuelRuntime — Google Contacts Tool (Sprint 89)", () => {
  it("aciona google-contacts para telefone e interpreta sem JSON", async () => {
    const result = await runSamuelRuntime({
      query: "Qual o telefone do João?",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.tooling).toMatchObject({
      attempted: true,
      toolName: "google-contacts",
      status: "success",
    });
    expect(result.tooling.input).toMatchObject({ actionId: "contacts_phone", name: "João" });
    expect(generateNarrativeViaAIGatewayMock).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationContext: expect.stringContaining("Google Contacts Tool"),
      }),
    );
    expect(result.response.narrative).not.toContain('"phone"');
    expect(result.response.narrative).toContain("+351 912 345 678");
  });

  it("usa humanFallback legível quando o AI Gateway não responde", async () => {
    generateNarrativeViaAIGatewayMock.mockResolvedValue(null);

    const result = await runSamuelRuntime({
      query: "Qual o telefone do João?",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.response.narrative).toContain("Telefone de João Silva");
    expect(result.response.narrative).not.toContain('"contacts"');
  });
});
