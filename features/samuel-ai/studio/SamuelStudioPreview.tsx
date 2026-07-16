"use client";

import { useEffect, useMemo } from "react";
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
      <SandpackLayout className="samuel-studio-sandpack">
        <SandpackCodeEditor
          showTabs
          showLineNumbers
          wrapContent
          style={{ height: 560 }}
        />
        <SandpackPreview
          showNavigator
          showOpenInCodeSandbox={false}
          showRefreshButton
          style={{ height: 560 }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}
