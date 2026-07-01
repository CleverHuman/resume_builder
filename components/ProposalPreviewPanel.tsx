export default function ProposalPreviewPanel({ text }: { text: string }) {
  if (!text.trim()) {
    return (
      <div className="flex h-full items-center justify-center text-[#64748b] text-sm">
        Start typing to preview
      </div>
    );
  }

  return (
    <div className="bg-white text-[#111111] font-[Calibri,_sans-serif] h-full overflow-auto">
      <div className="px-16 py-12 text-[11pt] leading-[1.6] whitespace-pre-wrap">{text}</div>
    </div>
  );
}
