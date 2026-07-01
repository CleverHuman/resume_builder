interface Props {
  canExport: boolean;
  onExportPdf: () => void;
  flashMessage: string;
}

export default function ProposalBottomBar({ canExport, onExportPdf, flashMessage }: Props) {
  return (
    <div className="h-[62px] shrink-0 bg-[#13131f] mt-[10px] flex items-center px-5 gap-3">
      <button
        onClick={onExportPdf}
        disabled={!canExport}
        className="rounded px-5 py-[10px] text-[13px] font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Download as PDF
      </button>
      {flashMessage && (
        <span className="text-[13px] text-[#10b981]">{flashMessage}</span>
      )}
    </div>
  );
}
