"use client";

import { json } from "@codemirror/lang-json";
import CodeMirror, { oneDark } from "@uiw/react-codemirror";
import { useRef } from "react";

export type StatusKind = "muted" | "ok" | "error";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onLoadSample: () => void;
  onLoadFile: (contents: string) => void;
}

export default function JsonEditorPanel({
  value,
  onChange,
  onLoadSample,
  onLoadFile,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    file.text().then(onLoadFile);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between mb-[6px]">
        <span className="text-[13px] font-bold text-[#e2e8f0]">JSON Input</span>
        <div className="flex gap-[6px]">
          <button
            onClick={onLoadSample}
            className="rounded px-[10px] py-1 text-[11px] text-white bg-[#374151] hover:bg-[#4b5563] cursor-pointer"
          >
            Load Sample
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded px-[10px] py-1 text-[11px] text-white bg-[#374151] hover:bg-[#4b5563] cursor-pointer"
          >
            Load File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFilePicked}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden rounded border border-[#3f3f5c] bg-[#1a1a2e]">
        <CodeMirror
          value={value}
          onChange={onChange}
          height="100%"
          theme={oneDark}
          extensions={[json()]}
          basicSetup={{ foldGutter: true, lineNumbers: true }}
          className="h-full text-[13px]"
        />
      </div>
    </div>
  );
}
