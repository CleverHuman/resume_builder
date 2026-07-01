"use client";

import BottomBar from "@/components/BottomBar";
import JsonEditorPanel from "@/components/JsonEditorPanel";
import PreviewPanel from "@/components/PreviewPanel";
import { downloadBlob } from "@/lib/downloadBlob";
import { buildResumeFilename } from "@/lib/resumeHelpers";
import { SAMPLE } from "@/lib/sampleData";
import { ResumeData } from "@/lib/types";
import { useEffect, useMemo, useRef, useState } from "react";

const AUTO_PREVIEW_DELAY_MS = 400;

type StatusKind = "muted" | "ok" | "error";

const STATUS_COLOR: Record<StatusKind, string> = {
  muted: "text-[#64748b]",
  ok: "text-[#10b981]",
  error: "text-[#ef4444]",
};

export default function ResumeBuilderView() {
  const [jsonText, setJsonText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [flashMessage, setFlashMessage] = useState("");
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flash(text: string) {
    setFlashMessage(text);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashMessage(""), 5000);
  }

  function handleLoadSample() {
    setJsonText(JSON.stringify(SAMPLE, null, 2));
  }

  function handleLoadFile(contents: string) {
    setJsonText(contents);
  }

  // Debounce the raw text so we don't reparse on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedText(jsonText), AUTO_PREVIEW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [jsonText]);

  const { resumeData, status, statusKind } = useMemo(() => {
    const raw = debouncedText.trim();
    if (!raw) {
      return {
        resumeData: null as ResumeData | null,
        status: "Paste JSON to preview",
        statusKind: "muted" as StatusKind,
      };
    }
    try {
      const data = JSON.parse(raw) as ResumeData;
      return { resumeData: data, status: "Parsed successfully", statusKind: "ok" as StatusKind };
    } catch (e) {
      return {
        resumeData: null as ResumeData | null,
        status: `JSON error: ${(e as Error).message}`,
        statusKind: "error" as StatusKind,
      };
    }
  }, [debouncedText]);

  async function handleExportPdf() {
    if (!resumeData) return;
    const { generateResumePdfBlob } = await import("@/lib/pdf/generateResumePdf");
    const blob = await generateResumePdfBlob(resumeData);
    const filename = buildResumeFilename(resumeData.personal ?? {}, "pdf");
    downloadBlob(blob, filename);
    flash(`Saved: ${filename}`);
  }

  async function handleExportDocx() {
    if (!resumeData) return;
    const { generateResumeDocxBlob } = await import("@/lib/docx/generateResumeDocx");
    const blob = await generateResumeDocxBlob(resumeData);
    const filename = buildResumeFilename(resumeData.personal ?? {}, "docx");
    downloadBlob(blob, filename);
    flash(`Saved: ${filename}`);
  }

  return (
    <>
      <div className="flex flex-1 min-h-0 gap-3 px-3 pt-[10px]">
        <div className="w-[460px] shrink-0 flex flex-col">
          <JsonEditorPanel
            value={jsonText}
            onChange={setJsonText}
            onLoadSample={handleLoadSample}
            onLoadFile={handleLoadFile}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center justify-between mb-[6px]">
            <span className="text-[13px] font-bold text-[#e2e8f0]">Preview</span>
            <span className={`text-[12px] ${STATUS_COLOR[statusKind]}`}>{status}</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden rounded border border-[#3f3f5c] bg-[#2a2a3e]">
            <PreviewPanel data={resumeData} />
          </div>
        </div>
      </div>

      <BottomBar
        canExport={resumeData !== null}
        onExportPdf={handleExportPdf}
        onExportDocx={handleExportDocx}
        flashMessage={flashMessage}
      />
    </>
  );
}
