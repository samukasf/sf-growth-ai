/**
 * Google Drive Tool (Sprint 91) — acessa Google Drive real da empresa
 * via Tool Orchestrator, reutilizando OAuth/token refresh da Sprint 86.
 */
import { ToolExecutionError } from "@/features/samuel-tool-orchestrator/tool-execution-error";
import type { Tool, ToolExecutionContext } from "@/features/samuel-tool-orchestrator/types";

import {
  formatFileLine,
  getGoogleDriveProviderForCompany,
  truncateContent,
} from "./google-drive.provider";
import { extractTextFromBinary } from "./drive-binary-extractor";
import { DRIVE_MAX_DOWNLOAD_BYTES } from "./drive-binary-extractor";
import type {
  DriveActionId,
  DriveToolInput,
  DriveToolOutput,
  FileSummary,
  GoogleDriveFile,
} from "./types";
import { DRIVE_MAX_CONTENT_CHARS } from "./types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_MAX_RESULTS = 25;

function isUuidLike(value: string | undefined): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function describeError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "erro desconhecido";
}

function wrapDriveError(error: unknown): never {
  throw new ToolExecutionError("google-drive", describeError(error), error);
}

function isDriveToolEnabled(): boolean {
  return process.env.SAMUEL_GOOGLE_DRIVE_TOOL_ENABLED !== "false";
}

function buildListOutput(
  actionId: DriveActionId,
  label: string,
  files: FileSummary[],
): DriveToolOutput {
  const preview = files.map(formatFileLine).join("\n");
  return {
    actionId,
    summary:
      files.length > 0
        ? `${files.length} arquivo(s) ${label}.`
        : `Nenhum arquivo ${label}.`,
    data: {
      fileCount: files.length,
      files,
      preview,
      hasContent: false,
    },
  };
}

async function resolveFile(
  provider: Awaited<ReturnType<typeof getGoogleDriveProviderForCompany>>,
  input: DriveToolInput,
  mimeTypes?: string[],
): Promise<GoogleDriveFile | null> {
  if (input.fileId) {
    const byId = await provider.getFileById(input.fileId);
    if (byId) return byId;
  }

  const name = input.name?.trim();
  if (!name) return null;

  const files = mimeTypes ? await provider.findByName(name, mimeTypes) : await provider.findByName(name);
  return files[0] ?? null;
}

async function extractTextContent(
  provider: Awaited<ReturnType<typeof getGoogleDriveProviderForCompany>>,
  file: GoogleDriveFile,
): Promise<{ content?: string; contentAvailable: boolean; binaryParsed?: boolean }> {
  const exportMime = provider.resolveExportMime(file.mimeType);
  if (exportMime) {
    const raw = await provider.exportFileContent(file.id, exportMime);
    return {
      content: truncateContent(raw.trim(), DRIVE_MAX_CONTENT_CHARS),
      contentAvailable: true,
      binaryParsed: false,
    };
  }

  if (provider.isBinaryOfficeMime(file.mimeType)) {
    if (file.sizeBytes != null && file.sizeBytes > DRIVE_MAX_DOWNLOAD_BYTES) {
      return { contentAvailable: false, binaryParsed: false };
    }

    const binary = await provider.downloadFileBinary(file.id, DRIVE_MAX_DOWNLOAD_BYTES);
    const extracted = await extractTextFromBinary(file.mimeType, binary);
    if (extracted) {
      return {
        content: truncateContent(extracted, DRIVE_MAX_CONTENT_CHARS),
        contentAvailable: true,
        binaryParsed: true,
      };
    }
    return { contentAvailable: false, binaryParsed: false };
  }

  return { contentAvailable: false, binaryParsed: false };
}

const ACTION_HANDLERS: Record<
  DriveActionId,
  (companyId: string, input: DriveToolInput) => Promise<DriveToolOutput>
> = {
  drive_search: async (companyId, input) => {
    const query = input.query?.trim();
    if (!query) {
      throw new ToolExecutionError("google-drive", "Termo de busca ausente para drive_search.");
    }
    const provider = await getGoogleDriveProviderForCompany(companyId);
    const files = (await provider.searchFiles(query, input.maxResults ?? DEFAULT_MAX_RESULTS)).map(
      (file) => provider.toFileSummary(file),
    );
    return buildListOutput("drive_search", `encontrado(s) para "${query}"`, files);
  },
  drive_recent: async (companyId, input) => {
    const provider = await getGoogleDriveProviderForCompany(companyId);
    const files = (await provider.listRecent(input.maxResults ?? DEFAULT_MAX_RESULTS)).map((file) =>
      provider.toFileSummary(file),
    );
    return buildListOutput("drive_recent", "modificados recentemente", files);
  },
  drive_read_doc: async (companyId, input) => {
    const provider = await getGoogleDriveProviderForCompany(companyId);
    const file = await resolveFile(provider, input, ["application/vnd.google-apps.document"]);
    if (!file) {
      const name = input.name?.trim() || input.fileId || "solicitado";
      return {
        actionId: "drive_read_doc",
        summary: `Nenhum Google Doc encontrado para "${name}".`,
        data: { fileCount: 0, files: [], preview: "", hasContent: false },
      };
    }

    const summary = provider.toFileSummary(file);
    const { content, contentAvailable } = await extractTextContent(provider, file);
    const preview = content
      ? `${summary.name}:\n${content.slice(0, 500)}${content.length > 500 ? "…" : ""}`
      : formatFileLine(summary);

    return {
      actionId: "drive_read_doc",
      summary: contentAvailable
        ? `Conteúdo do documento "${summary.name}" lido com sucesso.`
        : `Documento "${summary.name}" encontrado, mas o conteúdo não pôde ser exportado.`,
      data: {
        fileCount: 1,
        files: [summary],
        fileName: summary.name,
        mimeType: summary.mimeType,
        webViewLink: summary.webViewLink,
        content: content ?? null,
        preview,
        hasContent: Boolean(content),
      },
    };
  },
  drive_find_office: async (companyId, input) => {
    const name = input.name?.trim();
    if (!name) {
      throw new ToolExecutionError("google-drive", "Nome ausente para drive_find_office.");
    }
    const provider = await getGoogleDriveProviderForCompany(companyId);
    const files = (await provider.findOfficeByName(name, input.fileType)).map((file) =>
      provider.toFileSummary(file),
    );
    const typeLabel = input.fileType ? ` (${input.fileType.toUpperCase()})` : "";
    return buildListOutput("drive_find_office", `encontrado(s) para "${name}"${typeLabel}`, files);
  },
  drive_download: async (companyId, input) => {
    const provider = await getGoogleDriveProviderForCompany(companyId);
    const mimeFilter = input.fileType
      ? undefined
      : [
          "application/vnd.google-apps.document",
          "application/vnd.google-apps.spreadsheet",
          "application/vnd.google-apps.presentation",
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ];

    let file: GoogleDriveFile | null = null;
    if (input.fileType) {
      const matches = await provider.findOfficeByName(input.name?.trim() ?? "", input.fileType);
      file = matches[0] ?? null;
    } else {
      file = await resolveFile(provider, input, mimeFilter);
    }

    if (!file) {
      const name = input.name?.trim() || input.fileId || "solicitado";
      return {
        actionId: "drive_download",
        summary: `Nenhum arquivo compatível encontrado para "${name}".`,
        data: { fileCount: 0, files: [], preview: "", hasContent: false },
      };
    }

    const summary = provider.toFileSummary(file);
    const { content, contentAvailable, binaryParsed } = await extractTextContent(provider, file);
    const isBinary = provider.isBinaryOfficeMime(file.mimeType);

    return {
      actionId: "drive_download",
      summary: contentAvailable
        ? `Conteúdo extraído de "${summary.name}".`
        : isBinary
          ? `Arquivo "${summary.name}" localizado (${summary.mimeLabel}) — conteúdo binário não pôde ser extraído.`
          : `Arquivo "${summary.name}" localizado.`,
      data: {
        fileCount: 1,
        files: [summary],
        fileName: summary.name,
        mimeType: summary.mimeType,
        webViewLink: summary.webViewLink,
        sizeBytes: summary.sizeBytes,
        content: content ?? null,
        preview: content ? content.slice(0, 500) : formatFileLine(summary),
        hasContent: Boolean(content),
        binaryParsed: binaryParsed ?? false,
        binaryOnly: isBinary && !contentAvailable,
      },
    };
  },
};

export class DriveTool implements Tool<DriveToolInput, DriveToolOutput> {
  readonly name = "google-drive";
  readonly description =
    "Acessa o Google Drive real da empresa: pesquisar arquivos, listar recentes, ler Google Docs e localizar PDF/DOCX/XLSX/PPTX.";
  readonly inputSchema = {
    actionId:
      "'drive_search' | 'drive_recent' | 'drive_read_doc' | 'drive_find_office' | 'drive_download'",
    query: "string (drive_search)",
    name: "string (drive_read_doc, drive_find_office, drive_download)",
    fileId: "string (opcional)",
    fileType: "'pdf' | 'docx' | 'xlsx' | 'pptx' (opcional)",
    maxResults: "number (opcional)",
  };

  async execute(context: ToolExecutionContext<DriveToolInput>): Promise<DriveToolOutput> {
    if (!isDriveToolEnabled()) {
      throw new ToolExecutionError(
        this.name,
        "Google Drive Tool está desabilitada (SAMUEL_GOOGLE_DRIVE_TOOL_ENABLED=false).",
      );
    }

    const { actionId } = context.input;
    const handler = ACTION_HANDLERS[actionId];
    if (!handler) {
      throw new ToolExecutionError(
        this.name,
        `actionId desconhecido ou não autorizado: "${actionId}".`,
      );
    }

    if (!isUuidLike(context.companyId)) {
      throw new ToolExecutionError(
        this.name,
        `companyId ausente ou inválido — não é possível acessar o Drive para "${context.companyId ?? "undefined"}".`,
      );
    }

    try {
      return await handler(context.companyId, context.input);
    } catch (error) {
      if (error instanceof ToolExecutionError) throw error;
      wrapDriveError(error);
    }
  }
}
