"use client";

import BottomBar from "@/components/BottomBar";
import JsonEditorPanel from "@/components/JsonEditorPanel";
import PreviewPanel from "@/components/PreviewPanel";
import ResizableSplit from "@/components/ResizableSplit";
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

interface Props {
  table: string;
  onRecordIdChange: (id: number) => void;
  showEducationExtras?: boolean;
}

export default function ResumeBuilderView({
  table,
  onRecordIdChange,
  showEducationExtras = false,
}: Props) {
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
    const blob = await generateResumePdfBlob(resumeData, { showEducationExtras });
    const filename = buildResumeFilename(resumeData.personal ?? {}, "pdf");
    downloadBlob(blob, filename);
    flash(`Saved: ${filename}`);
  }

  async function handleExportDocx() {
    if (!resumeData) return;

    const { saveResumeRecord } = await import("@/lib/supabase/resumeRecords");
    const result = await saveResumeRecord(resumeData, table);

    if (result.status === "invalid") {
      alert(`Missing required field(s): ${result.missingFields.join(", ")}`);
      return;
    }
    if (result.status === "duplicate") {
      alert("You Already Submitted your application!");
      return;
    }
    if (result.status === "error") {
      alert(`Could not save to Supabase: ${result.error}`);
      return;
    }

    onRecordIdChange(result.id);

    const { generateResumeDocxBlob } = await import("@/lib/docx/generateResumeDocx");
    const blob = await generateResumeDocxBlob(resumeData, { showEducationExtras });
    const filename = buildResumeFilename(resumeData.personal ?? {}, "docx");
    downloadBlob(blob, filename);
    flash(`Saved: ${filename} (synced)`);
  }

  async function handleExportDocxWithoutSave() {
    if (!resumeData) return;
    const { generateResumeDocxBlob } = await import("@/lib/docx/generateResumeDocx");
    const blob = await generateResumeDocxBlob(resumeData, { showEducationExtras });
    const filename = buildResumeFilename(resumeData.personal ?? {}, "docx");
    downloadBlob(blob, filename);
    flash(`Saved: ${filename} (asynchronously)`);
  }

  return (
    <>
      <div className="flex flex-1 min-h-0 px-3 pt-[10px]">
        <ResizableSplit
          storageKey="resumeApp.resumeSplitWidth"
          left={
            <JsonEditorPanel
              value={jsonText}
              onChange={setJsonText}
              onLoadSample={handleLoadSample}
              onLoadFile={handleLoadFile}
            />
          }
          right={
            <div className="flex h-full min-h-0 flex-col">
              <div className="mb-[6px] flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#e2e8f0]">Preview</span>
                <span className={`text-[12px] ${STATUS_COLOR[statusKind]}`}>{status}</span>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden rounded border border-[#3f3f5c] bg-[#2a2a3e]">
                <PreviewPanel data={resumeData} showEducationExtras={showEducationExtras} />
              </div>
            </div>
          }
        />
      </div>

      <BottomBar
        canExport={resumeData !== null}
        onExportPdf={handleExportPdf}
        onExportDocx={handleExportDocx}
        onExportDocxWithoutSave={handleExportDocxWithoutSave}
        flashMessage={flashMessage}
      />
    </>
  );
}
