import {
  formatCalebContactLine,
  formatCalebLinkedIn,
  formatCalebSkillList,
  formatEducationDates,
  formatExperienceDates,
  formatExperienceLocation,
  parseBoldSegments,
  shouldShowCompanyHeader,
  skillEntries,
  toTitleCase,
} from "@/lib/resumeHelpers";
import { CALEB_COLORS, CALEB_FONT, CALEB_SECTIONS } from "@/lib/resumeStyle";
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
      className="mt-[10px] mb-[5px] border-b pb-[2px] text-[11pt] font-bold leading-[1.2] uppercase"
      style={{ color: CALEB_COLORS.dark, borderColor: CALEB_COLORS.rule }}
    >
      {children}
    </h2>
  );
}

interface Props {
  data: ResumeData | null;
  emptyMessage?: string;
}

export default function CalebPreviewPanel({
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
  const contact = formatCalebContactLine(personal);
  const linkedin = formatCalebLinkedIn(personal);
  const skills = skillEntries(data.skills);
  const experience = data.experience ?? [];
  const education = data.education ?? [];

  return (
    <div
      className="h-full overflow-auto bg-white px-6 py-5"
      style={{
        color: CALEB_COLORS.body,
        fontFamily: `${CALEB_FONT}, Arial, Helvetica, sans-serif`,
      }}
    >
      {personal.name && (
        <h1
          className="mb-[2px] text-center text-[20pt] font-bold leading-[1.2]"
          style={{ color: CALEB_COLORS.name }}
        >
          {toTitleCase(personal.name)}
        </h1>
      )}

      {personal.title && (
        <p
          className="mb-[2px] text-center text-[11pt] leading-[1.2]"
          style={{ color: CALEB_COLORS.dark }}
        >
          {personal.title}
        </p>
      )}

      {contact && (
        <p className="mb-[1px] text-center text-[10pt]" style={{ color: CALEB_COLORS.muted }}>
          {contact}
        </p>
      )}
      {linkedin && (
        <p className="mb-[6px] text-center text-[10pt]" style={{ color: CALEB_COLORS.muted }}>
          {linkedin}
        </p>
      )}

      {summary && (
        <section>
          <SectionTitle>{CALEB_SECTIONS.summary}</SectionTitle>
          <p className="mb-[2px] text-[10pt] leading-[1.35]">
            <BoldSpans text={summary} />
          </p>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <SectionTitle>{CALEB_SECTIONS.skills}</SectionTitle>
          {skills.map(([category, items]) => (
            <p key={category || "flat"} className="mb-[2px] text-[10pt] leading-[1.35]">
              {category && <strong>{category}: </strong>}
              {formatCalebSkillList(items)}
            </p>
          ))}
        </section>
      )}

      {experience.length > 0 && (
        <section>
          <SectionTitle>{CALEB_SECTIONS.experience}</SectionTitle>
          {experience.map((exp, i) => {
            const dates = formatExperienceDates(exp);
            const location = formatExperienceLocation(exp);
            const showCompany = shouldShowCompanyHeader(experience, i);
            return (
              <div key={i} className="mb-[2px]">
                {showCompany && (exp.company || location) && (
                  <div className="mt-[8px] flex items-baseline justify-between gap-2">
                    <p className="text-[10.5pt] font-bold leading-[1.3]">{exp.company}</p>
                    {location && (
                      <p
                        className="shrink-0 text-[10pt] leading-[1.3]"
                        style={{ color: CALEB_COLORS.muted }}
                      >
                        {location}
                      </p>
                    )}
                  </div>
                )}
                {(exp.position || dates) && (
                  <div
                    className={`mb-[3px] flex items-baseline justify-between gap-2 ${
                      showCompany ? "mt-[1px]" : "mt-[8px]"
                    }`}
                  >
                    <p
                      className="text-[10pt] font-bold italic leading-[1.3]"
                      style={{ color: CALEB_COLORS.position }}
                    >
                      {exp.position}
                    </p>
                    {dates && (
                      <p
                        className="shrink-0 text-[10pt] leading-[1.3]"
                        style={{ color: CALEB_COLORS.muted }}
                      >
                        {dates}
                      </p>
                    )}
                  </div>
                )}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="m-0 list-none p-0">
                    {exp.highlights.map((hl, j) => (
                      <li
                        key={j}
                        className="mb-[2px] pl-[14px] text-[10pt] leading-[1.35]"
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
          <SectionTitle>{CALEB_SECTIONS.education}</SectionTitle>
          {education.map((edu, i) => {
            const dates = formatEducationDates(edu);
            return (
              <div key={i} className="mt-[8px]">
                {(edu.institution || edu.location) && (
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[10.5pt] font-bold leading-[1.3]">{edu.institution}</p>
                    {edu.location && (
                      <p
                        className="shrink-0 text-[10pt] leading-[1.3]"
                        style={{ color: CALEB_COLORS.muted }}
                      >
                        {edu.location}
                      </p>
                    )}
                  </div>
                )}
                {(edu.degree || dates) && (
                  <div className="mt-[1px] flex items-baseline justify-between gap-2">
                    <p
                      className="text-[10pt] font-bold italic leading-[1.3]"
                      style={{ color: CALEB_COLORS.position }}
                    >
                      {edu.degree}
                    </p>
                    {dates && (
                      <p
                        className="shrink-0 text-[10pt] leading-[1.3]"
                        style={{ color: CALEB_COLORS.muted }}
                      >
                        {dates}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
