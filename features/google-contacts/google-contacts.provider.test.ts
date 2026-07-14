import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GoogleContactsProvider } from "./google-contacts.provider";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GoogleContactsProvider — chamadas reais à API", () => {
  const provider = new GoogleContactsProvider("test-access-token");

  beforeEach(() => {
    vi.setSystemTime(new Date("2026-07-13T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("busca contatos via people:searchContacts", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          {
            person: {
              resourceName: "people/123",
              names: [{ displayName: "João Silva" }],
              emailAddresses: [{ value: "joao@empresa.com" }],
              phoneNumbers: [{ value: "+351 912 345 678" }],
              organizations: [{ name: "Acme Labs" }],
            },
          },
        ],
      }),
    });

    const contacts = await provider.searchContacts("João");

    expect(contacts).toHaveLength(1);
    expect(contacts[0].name).toBe("João Silva");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("https://people.googleapis.com/v1/people:searchContacts"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-access-token",
        }),
      }),
    );
    expect(fetchMock.mock.calls[0][0]).toContain("query=Jo%C3%A3o");
    expect(fetchMock.mock.calls[0][0]).toContain("readMask=");
  });

  it("lista conexões via people/me/connections", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        connections: [
          {
            resourceName: "people/456",
            names: [{ displayName: "Maria Santos" }],
            organizations: [{ name: "Acme Labs" }],
            birthdays: [{ date: { month: 7, day: 20 } }],
          },
        ],
      }),
    });

    const contacts = await provider.getBirthdaysThisMonth();

    expect(contacts).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/people/me/connections"),
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock.mock.calls[0][0]).toContain("personFields=");
  });
});
