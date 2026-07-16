"use client";

import { useEffect, useMemo, useState } from "react";
import { Code2, Maximize2, Minimize2, MonitorPlay } from "lucide-react";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";

type SamuelStudioPreviewProps = {
  files: Record<string, string>;
  onFilesChange: (files: Record<string, string>) => void;
};

function FileSync({ onFilesChange }: Pick<SamuelStudioPreviewProps, "onFilesChange">) {
  const { sandpack } = useSandpack();
  const serializableFiles = useMemo(
    () => Object.fromEntries(
      Object.entries(sandpack.files)
        .filter(([path]) => ["/App.js", "/styles.css", "/data.js"].includes(path))
        .map(([path, file]) => [path, file.code]),
    ),
    [sandpack.files],
  );

  useEffect(() => onFilesChange(serializableFiles), [onFilesChange, serializableFiles]);
  return null;
}

export function SamuelStudioPreview({ files, onFilesChange }: SamuelStudioPreviewProps) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  return (
    <SandpackProvider
      template="react"
      theme="dark"
      files={files}
      options={{ activeFile: "/App.js", visibleFiles: ["/App.js", "/styles.css"] }}
      customSetup={{
        dependencies: {},
        entry: "/index.js",
      }}
    >
      <FileSync onFilesChange={onFilesChange} />
      <div className={`samuel-studio-preview-shell${fullscreen ? " is-fullscreen" : ""}`}>
        <div className="samuel-studio-preview-toolbar">
          <div>
            <span>PROJETO EXECUTÁVEL</span>
            <strong>{view === "preview" ? "Experiência navegável" : "Editor do projeto"}</strong>
          </div>
          <div role="group" aria-label="Visualização do projeto">
            <button type="button" className={view === "preview" ? "is-active" : undefined} onClick={() => setView("preview")}>
              <MonitorPlay /> Navegar
            </button>
            <button type="button" className={view === "code" ? "is-active" : undefined} onClick={() => setView("code")}>
              <Code2 /> Código
            </button>
            <button type="button" onClick={() => setFullscreen((current) => !current)} aria-label={fullscreen ? "Sair da tela cheia" : "Abrir projeto em tela cheia"}>
              {fullscreen ? <Minimize2 /> : <Maximize2 />} {fullscreen ? "Sair" : "Tela cheia"}
            </button>
          </div>
        </div>
        <SandpackLayout className={`samuel-studio-sandpack is-${view}`}>
          {view === "code" && (
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              wrapContent
              style={{ height: fullscreen ? "calc(100dvh - 76px)" : 620 }}
            />
          )}
          <SandpackPreview
            showNavigator
            showOpenInCodeSandbox={false}
            showRefreshButton
            style={{ height: fullscreen ? "calc(100dvh - 76px)" : 620 }}
          />
        </SandpackLayout>
      </div>
    </SandpackProvider>
  );
}
