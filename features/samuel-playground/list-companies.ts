import { supabase } from "@/lib/supabase/client";

export type PlaygroundCompanyOption = {
  id: string;
  name: string;
};

/**
 * Leitura simples e isolada, exclusiva do Samuel Playground, para popular o
 * seletor de empresa em `/debug/samuel-playground`. Não substitui, chama ou
 * altera `services/executive-context.service.ts` — é uma consulta própria
 * desta ferramenta de desenvolvimento, sem qualquer impacto no fluxo real do
 * Samuel, no Company Brain ou no modelo multi-tenant.
 */
export async function listCompanies(): Promise<PlaygroundCompanyOption[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Falha ao listar empresas para o Samuel Playground: ${error.message}`);
  }

  return data ?? [];
}
