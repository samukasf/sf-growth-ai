export type SiteBuilderTone = "executive" | "premium" | "local";
export type SiteBuilderMode = "website" | "app";

export type SiteBuilderDraft = {
  mode: SiteBuilderMode;
  businessName: string;
  segment: string;
  offer: string;
  goal: string;
  location: string;
  cta: string;
  whatsapp: string;
  mapsQuery: string;
  tone: SiteBuilderTone;
};

const DEFAULT_DRAFT: SiteBuilderDraft = {
  mode: "website",
  businessName: "A sua empresa",
  segment: "serviços profissionais",
  offer: "soluções completas para clientes exigentes",
  goal: "gerar pedidos de orçamento qualificados",
  location: "Portugal",
  cta: "Pedir orçamento",
  whatsapp: "",
  mapsQuery: "",
  tone: "executive",
};

const TONE_THEME: Record<SiteBuilderTone, { accent: string; accent2: string; dark: string }> = {
  executive: { accent: "#2563eb", accent2: "#06b6d4", dark: "#061329" },
  premium: { accent: "#b45309", accent2: "#f59e0b", dark: "#17110a" },
  local: { accent: "#059669", accent2: "#14b8a6", dark: "#071711" },
};

function cleanText(value: string | undefined, fallback: string, maxLength = 120): string {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return (normalized || fallback).slice(0, maxLength);
}

function cleanOptionalText(value: string | undefined, maxLength = 120): string {
  return (value?.replace(/\s+/g, " ").trim() ?? "").slice(0, maxLength);
}

function cleanPhone(value: string | undefined): string {
  return (value ?? "").replace(/[^\d+]/g, "").slice(0, 24);
}

function buildWhatsAppUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "#contact";
}

function buildMapsUrl(query: string) {
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : "#contact";
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function normalizeSiteBuilderDraft(input: Partial<SiteBuilderDraft>): SiteBuilderDraft {
  const tone = input.tone && input.tone in TONE_THEME ? input.tone : DEFAULT_DRAFT.tone;
  const mode = input.mode === "app" ? "app" : DEFAULT_DRAFT.mode;

  return {
    mode,
    businessName: cleanText(input.businessName, DEFAULT_DRAFT.businessName, 70),
    segment: cleanText(input.segment, DEFAULT_DRAFT.segment, 90),
    offer: cleanText(input.offer, DEFAULT_DRAFT.offer, 150),
    goal: cleanText(input.goal, DEFAULT_DRAFT.goal, 150),
    location: cleanText(input.location, DEFAULT_DRAFT.location, 70),
    cta: cleanText(input.cta, DEFAULT_DRAFT.cta, 42),
    whatsapp: cleanPhone(input.whatsapp),
    mapsQuery: cleanOptionalText(input.mapsQuery, 140),
    tone,
  };
}

export function buildSiteBuilderFilename(input: Partial<SiteBuilderDraft>): string {
  const draft = normalizeSiteBuilderDraft(input);
  const slug = draft.businessName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "site-samuel-ai"}.html`;
}

export function buildSiteBuilderHtml(input: Partial<SiteBuilderDraft>): string {
  const draft = normalizeSiteBuilderDraft(input);
  const theme = TONE_THEME[draft.tone];
  const modeLabel = draft.mode === "app" ? "Mini-app navegável" : "Website completo";
  const businessName = escapeHtml(draft.businessName);
  const segment = escapeHtml(draft.segment);
  const offer = escapeHtml(draft.offer);
  const goal = escapeHtml(draft.goal);
  const location = escapeHtml(draft.location);
  const cta = escapeHtml(draft.cta);
  const whatsappUrl = buildWhatsAppUrl(draft.whatsapp);
  const mapsUrl = buildMapsUrl(draft.mapsQuery || `${draft.businessName} ${draft.location}`);
  const showAppSection = draft.mode === "app";

  return `<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${businessName}</title>
  <meta name="description" content="${businessName} - ${offer}" />
  <style>
    :root {
      color-scheme: light;
      --accent: ${theme.accent};
      --accent-2: ${theme.accent2};
      --dark: ${theme.dark};
      --text: #0f172a;
      --muted: #64748b;
      --line: rgba(15, 23, 42, .1);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; background: #f8fafc; color: var(--text); }
    a { color: inherit; text-decoration: none; }
    .shell { min-height: 100vh; overflow: hidden; }
    .hero {
      position: relative;
      min-height: 92vh;
      display: grid;
      align-items: center;
      padding: 28px clamp(20px, 5vw, 72px) 64px;
      background:
        radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--accent-2) 28%, transparent), transparent 32%),
        linear-gradient(135deg, #fff 0%, #eff6ff 46%, #f8fafc 100%);
    }
    .nav {
      position: fixed;
      z-index: 10;
      top: 18px;
      left: clamp(16px, 4vw, 54px);
      right: clamp(16px, 4vw, 54px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 14px;
      border: 1px solid rgba(255,255,255,.64);
      border-radius: 22px;
      background: rgba(255,255,255,.78);
      box-shadow: 0 20px 60px rgba(15,23,42,.09);
      backdrop-filter: blur(18px);
    }
    .brand { font-weight: 850; letter-spacing: .04em; }
    .nav-links { display: flex; gap: 10px; font-size: 13px; color: var(--muted); }
    .nav-links a { padding: 8px 10px; border-radius: 999px; }
    .nav-links a:hover { background: #fff; color: var(--accent); }
    .hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.08fr) minmax(280px, .92fr);
      gap: clamp(24px, 5vw, 72px);
      align-items: center;
      width: min(1120px, 100%);
      margin: 70px auto 0;
    }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 18px;
      color: var(--accent);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: .16em;
      text-transform: uppercase;
    }
    .eyebrow::before { content: ""; width: 8px; height: 8px; border-radius: 999px; background: var(--accent-2); box-shadow: 0 0 18px var(--accent-2); }
    h1 { max-width: 780px; margin: 0; color: #07112a; font-size: clamp(42px, 8vw, 88px); line-height: .92; letter-spacing: -.04em; }
    .lead { max-width: 640px; margin: 24px 0 0; color: #334155; font-size: clamp(17px, 2.2vw, 23px); line-height: 1.55; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 34px; }
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      padding: 0 20px;
      border-radius: 999px;
      font-weight: 800;
      box-shadow: 0 18px 40px color-mix(in srgb, var(--accent) 24%, transparent);
    }
    .button.primary { background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: white; }
    .button.secondary { border: 1px solid var(--line); background: rgba(255,255,255,.74); color: #0f172a; box-shadow: none; }
    .visual {
      min-height: 440px;
      border-radius: 34px;
      padding: 24px;
      background: linear-gradient(145deg, var(--dark), #0f172a);
      color: white;
      box-shadow: 0 34px 90px rgba(15,23,42,.24);
      display: grid;
      align-content: end;
      position: relative;
      overflow: hidden;
    }
    .visual::before {
      content: "";
      position: absolute;
      inset: -20%;
      background: radial-gradient(circle, color-mix(in srgb, var(--accent-2) 34%, transparent), transparent 36%);
      animation: pulse 7s ease-in-out infinite;
    }
    .visual-card { position: relative; border: 1px solid rgba(255,255,255,.15); border-radius: 24px; padding: 22px; background: rgba(255,255,255,.08); backdrop-filter: blur(12px); }
    .visual-card strong { display: block; font-size: 28px; margin-bottom: 8px; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 18px; }
    .metric { border-top: 1px solid rgba(255,255,255,.16); padding-top: 14px; }
    .metric b { display: block; font-size: 20px; }
    .metric span { color: rgba(255,255,255,.66); font-size: 12px; }
    section.content { padding: 76px clamp(20px, 5vw, 72px); background: white; }
    .section-inner { width: min(1120px, 100%); margin: 0 auto; }
    .section-title { margin: 0 0 22px; font-size: clamp(30px, 4vw, 52px); letter-spacing: -.035em; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .card { border: 1px solid var(--line); border-radius: 24px; padding: 24px; background: #fff; box-shadow: 0 18px 44px rgba(15,23,42,.06); }
    .card b { display: block; margin-bottom: 10px; font-size: 18px; }
    .card p, .contact p { color: var(--muted); line-height: 1.65; }
    .contact { display: grid; grid-template-columns: 1fr .9fr; gap: 22px; align-items: stretch; }
    .contact-box { border-radius: 28px; padding: 28px; background: linear-gradient(135deg, var(--dark), #111827); color: white; }
    .contact-box p { color: rgba(255,255,255,.72); }
    .channel-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 18px; }
    .channel { border: 1px solid rgba(255,255,255,.16); border-radius: 18px; padding: 14px; color: white; background: rgba(255,255,255,.08); }
    .app-demo { display: grid; grid-template-columns: .82fr 1.18fr; gap: 18px; align-items: stretch; }
    .app-device {
      min-height: 520px;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 36px;
      padding: 18px;
      background: radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--accent-2) 28%, transparent), transparent 34%), linear-gradient(160deg, #020617, var(--dark));
      box-shadow: 0 34px 90px rgba(15,23,42,.26);
      color: white;
    }
    .app-status { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; color: rgba(255,255,255,.62); }
    .app-card { margin-top: 18px; border-radius: 28px; padding: 20px; background: rgba(255,255,255,.1); backdrop-filter: blur(14px); }
    .app-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 18px; }
    .app-tabs button { min-height: 42px; border: 0; border-radius: 16px; color: rgba(255,255,255,.68); background: rgba(255,255,255,.08); font-weight: 800; cursor: pointer; }
    .app-tabs button.active { color: #031026; background: white; }
    .app-panel { display: none; margin-top: 14px; border-radius: 22px; padding: 18px; background: rgba(255,255,255,.1); }
    .app-panel.active { display: block; }
    .app-panel b { display: block; font-size: 28px; }
    .app-roadmap { display: grid; gap: 12px; }
    .roadmap-item { border: 1px solid var(--line); border-radius: 20px; padding: 18px; background: #fff; }
    .roadmap-item span { display: block; color: var(--accent); font-size: 12px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
    footer { padding: 28px clamp(20px, 5vw, 72px); color: #64748b; background: #f8fafc; }
    @keyframes pulse { 0%, 100% { transform: translate3d(-5%, -2%, 0) scale(1); opacity: .7; } 50% { transform: translate3d(6%, 4%, 0) scale(1.08); opacity: 1; } }
    @media (max-width: 820px) {
      .nav { top: 10px; left: 10px; right: 10px; }
      .nav-links { display: none; }
      .hero { padding-inline: 18px; }
      .hero-grid, .contact, .app-demo { grid-template-columns: 1fr; }
      .visual { min-height: 320px; }
      .cards { grid-template-columns: 1fr; }
      .channel-grid { grid-template-columns: 1fr; }
      .metrics { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <nav class="nav" aria-label="Navegação principal">
      <a class="brand" href="#home">${businessName}</a>
      <div class="nav-links">
        <a href="#services">Serviços</a>
        <a href="#proof">Resultados</a>
        ${showAppSection ? '<a href="#app">App</a>' : ""}
        <a href="#contact">Contato</a>
      </div>
    </nav>
    <main id="home" class="hero">
      <div class="hero-grid">
        <div>
          <p class="eyebrow">${segment} em ${location}</p>
          <h1>${offer}</h1>
          <p class="lead">${businessName} ajuda clientes a ${goal} com atendimento claro, execução profissional e uma experiência preparada para converter.</p>
          <div class="actions">
            <a class="button primary" href="#contact">${cta}</a>
            <a class="button secondary" href="#services">Ver serviços</a>
          </div>
        </div>
        <aside class="visual" aria-label="Resumo de performance">
          <div class="visual-card">
            <strong>${modeLabel} pronto para vender</strong>
            <span>Estrutura responsiva, CTA visível, navegação real e narrativa comercial objetiva.</span>
            <div class="metrics">
              <div class="metric"><b>24h</b><span>para validar a primeira versão</span></div>
              <div class="metric"><b>${showAppSection ? "5" : "4"}</b><span>áreas navegáveis</span></div>
              <div class="metric"><b>SEO</b><span>base técnica incluída</span></div>
            </div>
          </div>
        </aside>
      </div>
    </main>
    <section id="services" class="content">
      <div class="section-inner">
        <h2 class="section-title">Serviços principais</h2>
        <div class="cards">
          <article class="card"><b>Diagnóstico</b><p>Entendimento do negócio, público e oportunidade comercial antes da execução.</p></article>
          <article class="card"><b>Execução</b><p>Entrega organizada com páginas, conteúdo, chamada para ação e estrutura responsiva.</p></article>
          <article class="card"><b>Crescimento</b><p>Preparação para campanhas, métricas e melhoria contínua depois da publicação.</p></article>
        </div>
      </div>
    </section>
    <section id="proof" class="content">
      <div class="section-inner">
        <h2 class="section-title">Resultado esperado</h2>
        <div class="cards">
          <article class="card"><b>Mais confiança</b><p>Uma presença profissional reduz dúvidas e aumenta a percepção de valor.</p></article>
          <article class="card"><b>Mais contatos</b><p>O site conduz o visitante para orçamento, WhatsApp, chamada ou formulário.</p></article>
          <article class="card"><b>Mais controlo</b><p>Conteúdo e métricas ficam prontos para campanhas e decisões comerciais.</p></article>
        </div>
      </div>
    </section>
    ${showAppSection ? `
    <section id="app" class="content">
      <div class="section-inner app-demo">
        <div class="app-device">
          <div class="app-status"><span>9:41</span><span>${businessName}</span></div>
          <div class="app-card">
            <p class="eyebrow">Painel inteligente</p>
            <h2 style="margin:0;font-size:34px;line-height:1;">Operação em tempo real</h2>
            <p style="color:rgba(255,255,255,.7);line-height:1.55;">Mini-app navegável para acompanhar leads, pedidos e tarefas comerciais sem depender de planilhas soltas.</p>
            <div class="app-tabs" role="tablist">
              <button class="active" data-tab="leads" type="button">Leads</button>
              <button data-tab="agenda" type="button">Agenda</button>
              <button data-tab="acoes" type="button">Ações</button>
            </div>
            <div class="app-panel active" data-panel="leads"><b>18</b><span>leads qualificados aguardando contato</span></div>
            <div class="app-panel" data-panel="agenda"><b>5</b><span>compromissos comerciais para esta semana</span></div>
            <div class="app-panel" data-panel="acoes"><b>3</b><span>ações prioritárias recomendadas pelo Samuel AI</span></div>
          </div>
        </div>
        <div class="app-roadmap">
          <h2 class="section-title">O app que acompanha o site</h2>
          <div class="roadmap-item"><span>Etapa 1</span><b>Captura</b><p>Formulários, WhatsApp e campanhas entram numa fila única de oportunidades.</p></div>
          <div class="roadmap-item"><span>Etapa 2</span><b>Execução</b><p>Tarefas, agenda e follow-up ficam organizados para não perder clientes.</p></div>
          <div class="roadmap-item"><span>Etapa 3</span><b>Inteligência</b><p>Samuel AI recomenda prioridades com base nos dados conectados.</p></div>
        </div>
      </div>
    </section>` : ""}
    <section id="contact" class="content">
      <div class="section-inner contact">
        <div>
          <h2 class="section-title">Vamos conversar?</h2>
          <p>${businessName} está pronto para receber novos pedidos em ${location}. O próximo passo é transformar esta versão em entrega final com domínio, analytics e publicação.</p>
          <div class="actions">
            <a class="button secondary" href="${mapsUrl}" target="_blank" rel="noreferrer">Abrir no Google Maps</a>
          </div>
        </div>
        <div class="contact-box">
          <h3>${cta}</h3>
          <p>Responda pelo canal preferido e confirme o objetivo: ${goal}.</p>
          <div class="channel-grid">
            <a class="channel" href="${whatsappUrl}" target="_blank" rel="noreferrer"><b>WhatsApp</b><br><span>Atendimento direto</span></a>
            <a class="channel" href="mailto:contato@example.com"><b>E-mail</b><br><span>Pedido formal</span></a>
          </div>
        </div>
      </div>
    </section>
    <footer>${businessName} - Website criado com Samuel AI</footer>
  </div>
  <script>
    document.querySelectorAll("[data-tab]").forEach(function(button) {
      button.addEventListener("click", function() {
        var tab = button.getAttribute("data-tab");
        document.querySelectorAll("[data-tab]").forEach(function(item) { item.classList.remove("active"); });
        document.querySelectorAll("[data-panel]").forEach(function(item) { item.classList.toggle("active", item.getAttribute("data-panel") === tab); });
        button.classList.add("active");
      });
    });
  </script>
</body>
</html>`;
}
