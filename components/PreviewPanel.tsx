import {
  formatContactLine,
  formatEducationMeta,
  formatExperienceMeta,
  parseBoldSegments,
  skillEntries,
} from "@/lib/resumeHelpers";
import { ResumeData } from "@/lib/types";

function Bullet({ text }: { text: string }) {
  return (
    <li className="pl-[18px] -indent-[9px] leading-[1.4] text-[10pt] text-[#111111] mb-[2px] list-none">
      <span>{"• "}</span>
      {parseBoldSegments(text).map((seg, i) =>
        seg.bold ? (
          <strong key={i}>{seg.text}</strong>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </li>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2 className="text-[13pt] font-bold text-[#111111] mt-[14px] mb-[1px] leading-[1.2]">
        {children}
      </h2>
      <hr className="border-t border-black mb-[6px]" />
    </>
  );
}

export default function PreviewPanel({ data }: { data: ResumeData | null }) {
  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-[#64748b] text-sm">
        Paste JSON then click Parse
      </div>
    );
  }

  const personal = data.personal ?? {};
  const summary = data.summary ?? personal.summary ?? "";
  const contact = formatContactLine(personal);
  const skills = skillEntries(data.skills);
  const experience = data.experience ?? [];
  const education = data.education ?? [];

  return (
    <div className="bg-white text-[#111111] font-[Calibri,_sans-serif] px-6 py-6 h-full overflow-auto">
      {personal.name && (
        <h1 className="text-[22pt] font-bold text-center mb-[3px] leading-[1.2]">
          {personal.name}
        </h1>
      )}

      {personal.title && (
        <p className="text-[13pt] font-semibold text-center mb-[6px] leading-[1.2]">
          {personal.title}
        </p>
      )}

      {contact && (
        <p className="text-[10pt] text-center mb-[8px]">{contact}</p>
      )}

      {summary && (
        <section>
          <SectionTitle>SUMMARY</SectionTitle>
          <p className="text-[10pt] leading-[1.4] mb-[4px]">{summary}</p>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <SectionTitle>TECHNICAL SKILLS</SectionTitle>
          {skills.map(([category, items]) => (
            <p key={category || "flat"} className="text-[10pt] leading-[1.4] mb-[2px]">
              {category && <strong>{category}: </strong>}
              {items.join(" | ")}
            </p>
          ))}
        </section>
      )}

      {experience.length > 0 && (
        <section>
          <SectionTitle>WORK EXPERIENCE</SectionTitle>
          {experience.map((exp, i) => {
            const meta = formatExperienceMeta(exp);
            return (
              <div key={i} className="mb-[4px]">
                {exp.position && (
                  <p className="text-[10.5pt] font-bold mt-[10px] mb-[1px] leading-[1.4]">
                    {exp.position}
                  </p>
                )}
                {meta && (
                  <p className="text-[10pt] italic mb-[3px] leading-[1.4]">{meta}</p>
                )}
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
          <SectionTitle>EDUCATION</SectionTitle>
          {education.map((edu, i) => {
            const meta = formatEducationMeta(edu);
            return (
              <div key={i} className="mb-[4px]">
                {edu.degree && (
                  <p className="text-[10.5pt] font-bold mt-[10px] mb-[1px] leading-[1.4]">
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
