import {
  formatContactLine,
  formatEducationDates,
  formatEducationPlace,
  formatExperienceDates,
  formatExperienceLocation,
  parseBoldSegments,
  skillEntries,
} from "@/lib/resumeHelpers";
import { RESUME_COLORS, RESUME_FONT, RESUME_SECTIONS } from "@/lib/resumeStyle";
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
      className="mt-[10px] mb-[6px] border-b pb-[2px] text-[13pt] font-bold leading-[1.2]"
      style={{ color: RESUME_COLORS.accent, borderColor: RESUME_COLORS.accent }}
    >
      {children}
    </h2>
  );
}

interface Props {
  data: ResumeData | null;
  emptyMessage?: string;
}

export default function PreviewPanel({
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
  const contact = formatContactLine(personal);
  const skills = skillEntries(data.skills);
  const experience = data.experience ?? [];
  const education = data.education ?? [];

  return (
    <div
      className="h-full overflow-auto bg-white px-6 py-5"
      style={{
        color: RESUME_COLORS.dark,
        fontFamily: `${RESUME_FONT}, Georgia, 'Times New Roman', serif`,
      }}
    >
      {personal.name && (
        <h1
          className="mb-[2px] text-center text-[22pt] font-bold leading-[1.2]"
          style={{ color: RESUME_COLORS.dark }}
        >
          {personal.name.toUpperCase()}
        </h1>
      )}

      {personal.title && (
        <p
          className="mb-[4px] text-center text-[13pt] leading-[1.2]"
          style={{ color: RESUME_COLORS.accent }}
        >
          {personal.title}
        </p>
      )}

      {contact && (
        <p className="mb-[6px] text-center text-[11pt]" style={{ color: RESUME_COLORS.muted }}>
          {contact}
        </p>
      )}

      {summary && (
        <section>
          <SectionTitle>{RESUME_SECTIONS.summary}</SectionTitle>
          <p className="mb-[2px] text-justify text-[12pt] leading-[1.35]">
            <BoldSpans text={summary} />
          </p>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <SectionTitle>{RESUME_SECTIONS.skills}</SectionTitle>
          {skills.map(([category, items]) => (
            <p key={category || "flat"} className="mb-[2px] text-[12pt] leading-[1.35]">
              {category && <strong>{category}:  </strong>}
              {items.join(", ")}
            </p>
          ))}
        </section>
      )}

      {experience.length > 0 && (
        <section>
          <SectionTitle>{RESUME_SECTIONS.experience}</SectionTitle>
          {experience.map((exp, i) => {
            const dates = formatExperienceDates(exp);
            const location = formatExperienceLocation(exp);
            return (
              <div key={i} className="mb-[2px]">
                {(exp.position || dates) && (
                  <div className="mt-[8px] mb-[1px] flex items-baseline justify-between gap-2">
                    <p className="text-[12.5pt] font-bold leading-[1.3]">{exp.position}</p>
                    {dates && (
                      <p
                        className="shrink-0 text-[11.5pt] leading-[1.3]"
                        style={{ color: RESUME_COLORS.muted }}
                      >
                        {dates}
                      </p>
                    )}
                  </div>
                )}
                {(exp.company || location) && (
                  <p className="mb-[3px] text-[12pt] leading-[1.3]">
                    {exp.company && (
                      <strong style={{ color: RESUME_COLORS.accent }}>{exp.company}</strong>
                    )}
                    {exp.company && location && (
                      <em style={{ color: RESUME_COLORS.muted }}>  •  </em>
                    )}
                    {location && <span style={{ color: RESUME_COLORS.muted }}>{location}</span>}
                  </p>
                )}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="m-0 list-none p-0">
                    {exp.highlights.map((hl, j) => (
                      <li
                        key={j}
                        className="mb-[2px] pl-[14px] text-[12pt] leading-[1.35]"
                        style={{
                          textIndent: "-12px",
                        }}
                      >
                        <span style={{ color: RESUME_COLORS.accent }}>• </span>
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
          <SectionTitle>{RESUME_SECTIONS.education}</SectionTitle>
          {education.map((edu, i) => {
            const place = formatEducationPlace(edu);
            const dates = formatEducationDates(edu);
            return (
              <div key={i} className="mt-[6px] flex items-baseline justify-between gap-2">
                <p className="text-[12pt] leading-[1.3]">
                  {edu.degree && <strong>{edu.degree}</strong>}
                  {edu.degree && place && (
                    <span style={{ color: RESUME_COLORS.muted }}>  —  {place}</span>
                  )}
                  {!edu.degree && place && (
                    <span style={{ color: RESUME_COLORS.muted }}>{place}</span>
                  )}
                </p>
                {dates && (
                  <p
                    className="shrink-0 text-[11.5pt] leading-[1.3]"
                    style={{ color: RESUME_COLORS.muted }}
                  >
                    {dates}
                  </p>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
