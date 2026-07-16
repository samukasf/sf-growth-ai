import { describe, expect, it } from "vitest";

import {
  buildSiteBuilderFilename,
  buildSiteBuilderHtml,
  normalizeSiteBuilderDraft,
} from "./site-builder-preview";

describe("site-builder-preview", () => {
  it("builds a navigable HTML document for the bottom preview panel", () => {
    const html = buildSiteBuilderHtml({
      businessName: "Grafgil",
      segment: "gráfica rápida",
      offer: "Impressão profissional em Odivelas",
      goal: "receber mais pedidos pelo WhatsApp",
      location: "Odivelas",
      cta: "Pedir orçamento",
    });

    expect(html).toContain("<!doctype html>");
    expect(html).toContain('href="#services"');
    expect(html).toContain('id="contact"');
    expect(html).toContain("Grafgil");
  });

  it("escapes unsafe text before writing iframe srcDoc", () => {
    const html = buildSiteBuilderHtml({
      businessName: '<script>alert("x")</script>',
      offer: "Site <forte>",
    });

    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Site &lt;forte&gt;");
  });

  it("normalizes missing fields and creates a stable filename", () => {
    expect(normalizeSiteBuilderDraft({ businessName: "" }).businessName).toBe("A sua empresa");
    expect(buildSiteBuilderFilename({ businessName: "Gráfica São João" })).toBe(
      "grafica-sao-joao.html",
    );
  });
});
