"use client";

import { useState } from "react";
import { Building2, ExternalLink, Loader2, MapPin, Search } from "lucide-react";

type Place = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  primaryType: string | null;
};

type BusinessAccount = {
  name: string;
  accountName: string | null;
  type: string | null;
  role: string | null;
};

export function GoogleIntegrationTestPanel({ companyId }: { companyId: string }) {
  const [query, setQuery] = useState("restaurantes em Lisboa");
  const [places, setPlaces] = useState<Place[]>([]);
  const [accounts, setAccounts] = useState<BusinessAccount[]>([]);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [businessError, setBusinessError] = useState<string | null>(null);

  async function testMaps() {
    setMapsLoading(true);
    setMapsError(null);
    try {
      const response = await fetch("/api/integrations/google/maps/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, query, maxResults: 5 }),
      });
      const payload = (await response.json()) as { places?: Place[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Falha ao pesquisar no Google Maps.");
      setPlaces(payload.places ?? []);
    } catch (error) {
      setPlaces([]);
      setMapsError(error instanceof Error ? error.message : "Falha ao pesquisar no Google Maps.");
    } finally {
      setMapsLoading(false);
    }
  }

  async function testBusinessProfile() {
    setBusinessLoading(true);
    setBusinessError(null);
    try {
      const response = await fetch(
        `/api/integrations/google/business-profile/accounts?companyId=${encodeURIComponent(companyId)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as { accounts?: BusinessAccount[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Falha ao consultar Google Business Profile.");
      setAccounts(payload.accounts ?? []);
    } catch (error) {
      setAccounts([]);
      setBusinessError(error instanceof Error ? error.message : "Falha ao consultar Google Business Profile.");
    } finally {
      setBusinessLoading(false);
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article id="maps" className="rounded-3xl border border-white/[.08] bg-[#07131f] p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[.07] text-cyan-200"><MapPin className="size-5" /></span>
          <div><h2 className="text-base font-semibold text-white/90">Google Maps / Places</h2><p className="mt-1 text-xs leading-5 text-white/35">Teste a pesquisa real que o Samuel poderá usar para encontrar empresas, endereços e oportunidades.</p></div>
        </div>
        <div className="mt-4 flex gap-2">
          <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void testMaps(); }} className="min-w-0 flex-1 rounded-xl border border-white/[.08] bg-black/20 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-cyan-300/30" placeholder="Ex.: gráficas em Lisboa" />
          <button type="button" onClick={() => void testMaps()} disabled={mapsLoading || !query.trim()} className="flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[.08] px-3 py-2.5 text-xs font-semibold text-cyan-50 disabled:opacity-40">{mapsLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Testar</button>
        </div>
        {mapsError && <p className="mt-3 rounded-xl border border-amber-300/15 bg-amber-300/[.05] p-3 text-[10px] leading-5 text-amber-100/70">{mapsError}</p>}
        {places.length > 0 && <div className="mt-3 space-y-2">{places.map((place) => <div key={place.id} className="rounded-xl border border-white/[.06] bg-white/[.02] p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block truncate text-xs text-white/75">{place.name}</strong><span className="mt-1 block text-[10px] leading-4 text-white/30">{place.address ?? "Endereço não informado"}</span>{place.phone && <span className="mt-1 block text-[9px] text-white/28">{place.phone}</span>}</div>{place.googleMapsUrl && <a href={place.googleMapsUrl} target="_blank" rel="noreferrer" className="text-cyan-200/55 hover:text-cyan-100"><ExternalLink className="size-4" /></a>}</div></div>)}</div>}
      </article>

      <article id="business-profile" className="rounded-3xl border border-white/[.08] bg-[#07131f] p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[.07] text-emerald-200"><Building2 className="size-5" /></span>
          <div><h2 className="text-base font-semibold text-white/90">Google Business Profile</h2><p className="mt-1 text-xs leading-5 text-white/35">Valide se a conta autorizada dá acesso aos perfis empresariais que aparecem no Google e no Maps.</p></div>
        </div>
        <button type="button" onClick={() => void testBusinessProfile()} disabled={businessLoading} className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/[.07] px-3.5 py-2.5 text-xs font-semibold text-emerald-50 disabled:opacity-40">{businessLoading ? <Loader2 className="size-4 animate-spin" /> : <Building2 className="size-4" />} Verificar perfis</button>
        {businessError && <p className="mt-3 rounded-xl border border-amber-300/15 bg-amber-300/[.05] p-3 text-[10px] leading-5 text-amber-100/70">{businessError}</p>}
        {accounts.length > 0 && <div className="mt-3 space-y-2">{accounts.map((account) => <div key={account.name} className="rounded-xl border border-white/[.06] bg-white/[.02] p-3"><strong className="block text-xs text-white/75">{account.accountName ?? account.name}</strong><span className="mt-1 block text-[9px] text-white/28">{[account.type, account.role].filter(Boolean).join(" · ") || "Conta Business Profile"}</span></div>)}</div>}
        {!businessLoading && !businessError && accounts.length === 0 && <p className="mt-3 text-[10px] leading-5 text-white/25">Use “Verificar perfis” depois de conectar/reconectar o Google. Se a API Business Profile não estiver habilitada no projeto Google Cloud, o painel mostrará o erro real.</p>}
      </article>
    </section>
  );
}
