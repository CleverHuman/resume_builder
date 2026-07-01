interface Props {
  canExport: boolean;
  onExportPdf: () => void;
  onExportDocx: () => void;
  flashMessage: string;
}

export default function BottomBar({
  canExport,
  onExportPdf,
  onExportDocx,
  flashMessage,
}: Props) {
  return (
    <div className="h-[62px] shrink-0 bg-[#13131f] mt-[10px] flex items-center px-5 gap-3">
      <button
        onClick={onExportPdf}
        disabled={!canExport}
        className="rounded px-5 py-[10px] text-[13px] font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Export as PDF
      </button>
      <button
        onClick={onExportDocx}
        disabled={!canExport}
        className="rounded px-5 py-[10px] text-[13px] font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Export as DOCX
      </button>
      {flashMessage && (
        <span className="text-[13px] text-[#10b981]">{flashMessage}</span>
      )}
    </div>
  );
}
