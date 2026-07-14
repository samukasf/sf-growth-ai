import JSZip from "jszip";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { extractTextFromBinary } from "./drive-binary-extractor";

async function createMinimalPdf(text: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText(text, { x: 50, y: 700, size: 12, font });
  return new Uint8Array(await doc.save());
}

async function createMinimalDocx(text: string): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  );
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body>
</w:document>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );
  const buffer = await zip.generateAsync({ type: "uint8array" });
  return buffer;
}

async function createMinimalXlsx(): Promise<Uint8Array> {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([
    ["Produto", "Valor"],
    ["Widget", 42],
  ]);
  XLSX.utils.book_append_sheet(workbook, sheet, "Dados");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return new Uint8Array(buffer);
}

async function createMinimalPptx(): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`,
  );
  zip.file(
    "ppt/slides/slide1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Slide Drive Test</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld>
</p:sld>`,
  );
  return zip.generateAsync({ type: "uint8array" });
}

describe("extractTextFromBinary", () => {
  it("extrai texto de PDF real", async () => {
    const pdf = await createMinimalPdf("Hello Drive PDF");
    const text = await extractTextFromBinary("application/pdf", pdf);
    expect(text.toLowerCase()).toContain("hello drive pdf");
  });

  it("extrai texto de DOCX real", async () => {
    const docx = await createMinimalDocx("Contrato de serviços");
    const text = await extractTextFromBinary(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      docx,
    );
    expect(text).toContain("Contrato de serviços");
  });

  it("extrai texto de XLSX real", async () => {
    const xlsx = await createMinimalXlsx();
    const text = await extractTextFromBinary(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      xlsx,
    );
    expect(text).toContain("Produto");
    expect(text).toContain("Widget");
    expect(text).toContain("42");
  });

  it("extrai texto de PPTX real", async () => {
    const pptx = await createMinimalPptx();
    const text = await extractTextFromBinary(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      pptx,
    );
    expect(text).toContain("Slide Drive Test");
  });

  it("devolve vazio para MIME não suportado", async () => {
    const text = await extractTextFromBinary("text/plain", new TextEncoder().encode("oi"));
    expect(text).toBe("");
  });
});
