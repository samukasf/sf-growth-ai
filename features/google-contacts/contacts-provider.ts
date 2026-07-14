import type { ContactSummary, GoogleContact } from "./types";

/**
 * Contrato do provedor de contatos — permite trocar a implementação
 * (Google People API real, mock em testes) sem alterar a Contacts Tool.
 */
export interface ContactsProvider {
  searchContacts(query: string, maxResults?: number): Promise<GoogleContact[]>;
  findContactByName(name: string): Promise<GoogleContact | null>;
  findByCompany(company: string, maxResults?: number): Promise<GoogleContact[]>;
  getBirthdaysThisMonth(maxResults?: number): Promise<GoogleContact[]>;
  toContactSummary(contact: GoogleContact): ContactSummary;
}
