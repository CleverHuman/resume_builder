"use client";

import ProposalBottomBar from "@/components/ProposalBottomBar";
import ProposalPreviewPanel from "@/components/ProposalPreviewPanel";
import ProposalTextPanel from "@/components/ProposalTextPanel";
import ResizableSplit from "@/components/ResizableSplit";
import { downloadBlob } from "@/lib/downloadBlob";
import { useRef, useState } from "react";

interface Props {
  recordId: number | null;
  table: string;
}

export default function ProposalBuilderView({ recordId, table }: Props) {
  const [text, setText] = useState("");
  const [flashMessage, setFlashMessage] = useState("");
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flash(message: string) {
    setFlashMessage(message);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashMessage(""), 5000);
  }

  async function handleExportPdf() {
    if (!text.trim()) return;

    if (!recordId) {
      alert("Download the Resume first!");
      return;
    }

    const { saveCoverLetterRecord } = await import("@/lib/supabase/resumeRecords");
    const result = await saveCoverLetterRecord(recordId, text, table);
    if (result.status === "no-resume") {
      alert("Download the Resume first!");
      return;
    }

    const { generateProposalPdfBlob } = await import("@/lib/pdf/generateProposalPdf");
    const blob = await generateProposalPdfBlob(text);
    const filename = "cover letter.pdf";
    downloadBlob(blob, filename);
    flash(
      result.status === "error"
        ? `Saved: ${filename} (sync failed: ${result.error})`
        : `Saved: ${filename} (synced)`
    );
  }

  return (
    <>
      <div className="flex flex-1 min-h-0 px-3 pt-[10px]">
        <ResizableSplit
          storageKey="resumeApp.proposalSplitWidth"
          left={<ProposalTextPanel value={text} onChange={setText} />}
          right={
            <div className="flex h-full min-h-0 flex-col">
              <div className="mb-[6px] flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#e2e8f0]">Preview</span>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden rounded border border-[#3f3f5c] bg-[#2a2a3e]">
                <ProposalPreviewPanel text={text} />
              </div>
            </div>
          }
        />
      </div>

      <ProposalBottomBar
        canExport={text.trim().length > 0}
        onExportPdf={handleExportPdf}
        flashMessage={flashMessage}
      />
    </>
  );
}
