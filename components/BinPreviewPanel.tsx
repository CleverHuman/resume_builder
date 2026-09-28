import {
  formatBinContactLine,
  formatBinEducationHeader,
  formatBinExperienceHeader,
  parseBoldSegments,
  skillEntries,
  toTitleCase,
} from "@/lib/resumeHelpers";
import { BIN_COLORS, BIN_FONT, BIN_SECTIONS } from "@/lib/resumeStyle";
import { ResumeData } from "@/lib/types";

function BoldSpans({ text }: { text: string }) {
  return (
    <>
      {parseBoldSegments(text).map((seg, i) =>
        seg.bold ? <strong key={i}>{seg.text}</strong> : <span key={i}>{seg.text}</span>
      )}
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mt-[12px] mb-[6px] border-b pb-[1px] text-[12pt] font-bold uppercase leading-[1.2]"
      style={{ color: BIN_COLORS.dark, borderColor: BIN_COLORS.rule }}
    >
      {children}
    </h2>
  );
}

interface Props {
  data: ResumeData | null;
  emptyMessage?: string;
}

export default function BinPreviewPanel({
  data,
  emptyMessage = "Load sample or paste resume JSON to preview",
}: Props) {
  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-[#64748b] text-sm">
        {emptyMessage}
      </div>
    );
  }

  const personal = data.personal ?? {};
  const summary = data.summary ?? personal.summary ?? "";
  const contact = formatBinContactLine(personal);
  const skills = skillEntries(data.skills);
  const experience = data.experience ?? [];
  const education = data.education ?? [];

  return (
    <div
      className="h-full overflow-auto bg-white px-6 py-6"
      style={{
        color: BIN_COLORS.dark,
        fontFamily: `${BIN_FONT}, Arial, Helvetica, sans-serif`,
      }}
    >
      {personal.name && (
        <h1 className="mb-[2px] text-center text-[22pt] font-bold leading-[1.2]">
          {toTitleCase(personal.name)}
        </h1>
      )}

      {contact && (
        <p className="mb-[8px] text-center text-[10pt]" style={{ color: BIN_COLORS.muted }}>
          {contact}
        </p>
      )}

      {summary && (
        <section>
          <SectionTitle>{BIN_SECTIONS.summary}</SectionTitle>
          <p className="mb-[2px] text-justify text-[11pt] leading-[1.35]">
            <BoldSpans text={summary} />
          </p>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <SectionTitle>{BIN_SECTIONS.skills}</SectionTitle>
          {skills.map(([category, items]) => (
            <p key={category || "flat"} className="mb-[2px] text-[11pt] leading-[1.35]">
              {category && <strong>{category}: </strong>}
              {items.join(" | ")}
            </p>
          ))}
        </section>
      )}

      {experience.length > 0 && (
        <section>
          <SectionTitle>{BIN_SECTIONS.experience}</SectionTitle>
          {experience.map((exp, i) => {
            const header = formatBinExperienceHeader(exp);
            return (
              <div key={i} className="mb-[4px]">
                {header && (
                  <p className="mt-[8px] mb-[2px] text-[11pt] font-bold leading-[1.35]">{header}</p>
                )}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="m-0 list-none p-0">
                    {exp.highlights.map((hl, j) => (
                      <li
                        key={j}
                        className="mb-[1px] pl-[14px] text-[11pt] leading-[1.35]"
                        style={{ textIndent: "-12px" }}
                      >
                        <span>• </span>
                        <BoldSpans text={hl} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </section>
      )}

      {education.length > 0 && (
        <section>
          <SectionTitle>{BIN_SECTIONS.education}</SectionTitle>
          {education.map((edu, i) => {
            const header = formatBinEducationHeader(edu);
            return header ? (
              <p key={i} className="mt-[6px] text-[11pt] font-bold leading-[1.35]">
                {header}
              </p>
            ) : null;
          })}
        </section>
      )}
    </div>
  );
}
