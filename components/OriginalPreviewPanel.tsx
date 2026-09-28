import {
  formatEducationMeta,
  formatExperienceMeta,
  formatOriginalContactLine,
  parseBoldSegments,
  skillEntries,
} from "@/lib/resumeHelpers";
import { ORIGINAL_COLORS, ORIGINAL_FONT, ORIGINAL_SECTIONS } from "@/lib/resumeStyle";
import { ResumeData } from "@/lib/types";

function Bullet({ text }: { text: string }) {
  return (
    <li className="pl-[18px] -indent-[9px] leading-[1.4] text-[10pt] mb-[2px] list-none">
      <span>{"• "}</span>
      {parseBoldSegments(text).map((seg, i) =>
        seg.bold ? <strong key={i}>{seg.text}</strong> : <span key={i}>{seg.text}</span>
      )}
    </li>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2
        className="mt-[14px] mb-[1px] text-[13pt] font-bold leading-[1.2]"
        style={{ color: ORIGINAL_COLORS.dark }}
      >
        {children}
      </h2>
      <hr className="mb-[6px] border-t border-black" />
    </>
  );
}

interface Props {
  data: ResumeData | null;
  emptyMessage?: string;
}

export default function OriginalPreviewPanel({
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
  const contact = formatOriginalContactLine(personal);
  const skills = skillEntries(data.skills);
  const experience = data.experience ?? [];
  const education = data.education ?? [];

  return (
    <div
      className="h-full overflow-auto bg-white px-6 py-6"
      style={{
        color: ORIGINAL_COLORS.dark,
        fontFamily: `${ORIGINAL_FONT}, Arial, Helvetica, sans-serif`,
      }}
    >
      {personal.name && (
        <h1 className="mb-[3px] text-center text-[22pt] font-bold leading-[1.2]">
          {personal.name}
        </h1>
      )}

      {personal.title && (
        <p className="mb-[6px] text-center text-[13pt] font-semibold leading-[1.2]">
          {personal.title}
        </p>
      )}

      {contact && <p className="mb-[8px] text-center text-[10pt]">{contact}</p>}

      {summary && (
        <section>
          <SectionTitle>{ORIGINAL_SECTIONS.summary}</SectionTitle>
          <p className="mb-[4px] text-[10pt] leading-[1.4]">{summary}</p>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <SectionTitle>{ORIGINAL_SECTIONS.skills}</SectionTitle>
          {skills.map(([category, items]) => (
            <p key={category || "flat"} className="mb-[2px] text-[10pt] leading-[1.4]">
              {category && <strong>{category}: </strong>}
              {items.join(" | ")}
            </p>
          ))}
        </section>
      )}

      {experience.length > 0 && (
        <section>
          <SectionTitle>{ORIGINAL_SECTIONS.experience}</SectionTitle>
          {experience.map((exp, i) => {
            const meta = formatExperienceMeta(exp);
            return (
              <div key={i} className="mb-[4px]">
                {exp.position && (
                  <p className="mt-[10px] mb-[1px] text-[10.5pt] font-bold leading-[1.4]">
                    {exp.position}
                  </p>
                )}
                {meta && <p className="mb-[3px] text-[10pt] italic leading-[1.4]">{meta}</p>}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul>
                    {exp.highlights.map((hl, j) => (
                      <Bullet key={j} text={hl} />
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
          <SectionTitle>{ORIGINAL_SECTIONS.education}</SectionTitle>
          {education.map((edu, i) => {
            const meta = formatEducationMeta(edu);
            return (
              <div key={i} className="mb-[4px]">
                {edu.degree && (
                  <p className="mt-[10px] mb-[1px] text-[10.5pt] font-bold leading-[1.4]">
                    {edu.degree}
                  </p>
                )}
                {meta && <p className="text-[10pt] italic leading-[1.4]">{meta}</p>}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
