"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ProposalTextPanel({ value, onChange }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between mb-[6px]">
        <span className="text-[13px] font-bold text-[#e2e8f0]">Cover Letter Text</span>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden rounded border border-[#3f3f5c] bg-[#1a1a2e]">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write or paste your cover letter here..."
          spellCheck={false}
          className="h-full w-full resize-none bg-transparent text-[#e2e8f0] font-[Consolas,monospace] text-[13px] leading-[1.5] p-3 outline-none placeholder:text-[#64748b]"
        />
      </div>
    </div>
  );
}
