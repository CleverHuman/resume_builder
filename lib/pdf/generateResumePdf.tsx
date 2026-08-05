import {
  formatContactLine,
  formatEducationDates,
  formatEducationPlace,
  formatExperienceDates,
  formatExperienceLocation,
  formatSkillList,
  parseBoldSegments,
  skillEntries,
} from "@/lib/resumeHelpers";
import {
  RESUME_COLORS,
  RESUME_PDF_FONT,
  RESUME_PDF_FONT_BOLD,
  RESUME_SECTIONS,
} from "@/lib/resumeStyle";
import { ResumeData } from "@/lib/types";
import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const MARGIN_X = 0.75 * 72;
const MARGIN_Y = 0.59 * 72;

const styles = StyleSheet.create({
  page: {
    paddingTop: MARGIN_Y,
    paddingBottom: MARGIN_Y,
    paddingLeft: MARGIN_X,
    paddingRight: MARGIN_X,
    color: RESUME_COLORS.dark,
    fontFamily: RESUME_PDF_FONT,
  },
  name: {
    fontFamily: RESUME_PDF_FONT_BOLD,
    fontSize: 22,
    textAlign: "center",
    marginBottom: 2,
    color: RESUME_COLORS.dark,
  },
  title: {
    fontFamily: RESUME_PDF_FONT,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 4,
    color: RESUME_COLORS.accent,
  },
  contact: {
    fontFamily: RESUME_PDF_FONT,
    fontSize: 11,
    textAlign: "center",
    marginBottom: 6,
    color: RESUME_COLORS.muted,
  },
  sectionTitle: {
    fontFamily: RESUME_PDF_FONT_BOLD,
    fontSize: 13,
    marginTop: 10,
    marginBottom: 2,
    color: RESUME_COLORS.accent,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: RESUME_COLORS.accent,
    marginBottom: 6,
  },
  body: {
    fontFamily: RESUME_PDF_FONT,
    fontSize: 12,
    lineHeight: 1.35,
    textAlign: "justify",
    color: RESUME_COLORS.dark,
  },
  skillLine: {
    fontFamily: RESUME_PDF_FONT,
    fontSize: 12,
    lineHeight: 1.35,
    marginBottom: 2,
    color: RESUME_COLORS.dark,
  },
  skillCategory: {
    fontFamily: RESUME_PDF_FONT_BOLD,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 8,
    marginBottom: 1,
  },
  position: {
    fontFamily: RESUME_PDF_FONT_BOLD,
    fontSize: 12.5,
    color: RESUME_COLORS.dark,
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  dates: {
    fontFamily: RESUME_PDF_FONT,
    fontSize: 11.5,
    color: RESUME_COLORS.muted,
  },
  companyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 3,
  },
  company: {
    fontFamily: RESUME_PDF_FONT_BOLD,
    fontSize: 12,
    color: RESUME_COLORS.accent,
  },
  companySep: {
    fontFamily: RESUME_PDF_FONT,
    fontSize: 11.5,
    color: RESUME_COLORS.muted,
  },
  location: {
    fontFamily: RESUME_PDF_FONT,
    fontSize: 11.5,
    color: RESUME_COLORS.muted,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 2,
  },
  bulletMark: {
    width: 12,
    fontFamily: RESUME_PDF_FONT,
    fontSize: 12,
    color: RESUME_COLORS.accent,
  },
  bulletText: {
    flex: 1,
    fontFamily: RESUME_PDF_FONT,
    fontSize: 12,
    lineHeight: 1.35,
    color: RESUME_COLORS.dark,
  },
  bold: {
    fontFamily: RESUME_PDF_FONT_BOLD,
  },
  eduHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 6,
  },
  eduDegree: {
    fontFamily: RESUME_PDF_FONT_BOLD,
    fontSize: 12,
    color: RESUME_COLORS.dark,
  },
  eduPlace: {
    fontFamily: RESUME_PDF_FONT,
    fontSize: 11.5,
    color: RESUME_COLORS.muted,
  },
});

function SectionTitle({ children }: { children: string }) {
  return (
    <>
      <Text style={styles.sectionTitle}>{children}</Text>
      <View style={styles.hr} />
    </>
  );
}

function BoldText({ text }: { text: string }) {
  return (
    <Text>
      {parseBoldSegments(text).map((seg, i) =>
        seg.bold ? (
          <Text key={i} style={styles.bold}>
            {seg.text}
          </Text>
        ) : (
          <Text key={i}>{seg.text}</Text>
        )
      )}
    </Text>
  );
}

function ResumePdfDocument({ data }: { data: ResumeData }) {
  const personal = data.personal ?? {};
  const summary = data.summary ?? personal.summary ?? "";
  const contact = formatContactLine(personal);
  const skills = skillEntries(data.skills);
  const experience = data.experience ?? [];
  const education = data.education ?? [];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {personal.name && (
          <Text style={styles.name}>{personal.name.toUpperCase()}</Text>
        )}
        {personal.title && <Text style={styles.title}>{personal.title}</Text>}
        {contact && <Text style={styles.contact}>{contact}</Text>}

        {summary && (
          <View>
            <SectionTitle>{RESUME_SECTIONS.summary}</SectionTitle>
            <Text style={[styles.body, { marginBottom: 2 }]}>
              <BoldText text={summary} />
            </Text>
          </View>
        )}

        {skills.length > 0 && (
          <View>
            <SectionTitle>{RESUME_SECTIONS.skills}</SectionTitle>
            {skills.map(([category, items]) => (
              <Text key={category || "flat"} style={styles.skillLine}>
                {category && <Text style={styles.skillCategory}>{category}: </Text>}
                {formatSkillList(items)}
              </Text>
            ))}
          </View>
        )}

        {experience.length > 0 && (
          <View>
            <SectionTitle>{RESUME_SECTIONS.experience}</SectionTitle>
            {experience.map((exp, i) => {
              const dates = formatExperienceDates(exp);
              const location = formatExperienceLocation(exp);
              return (
                <View key={i} wrap={false}>
                  {(exp.position || dates) && (
                    <View style={styles.expHeader}>
                      <Text style={styles.position}>{exp.position ?? ""}</Text>
                      {dates ? <Text style={styles.dates}>{dates}</Text> : null}
                    </View>
                  )}
                  {(exp.company || location) && (
                    <View style={styles.companyRow}>
                      {exp.company ? (
                        <Text style={styles.company}>{exp.company}</Text>
                      ) : null}
                      {exp.company && location ? (
                        <Text style={styles.companySep}> | </Text>
                      ) : null}
                      {location ? <Text style={styles.location}>{location}</Text> : null}
                    </View>
                  )}
                  {(exp.highlights ?? []).map((hl, j) => (
                    <View key={j} style={styles.bulletRow}>
                      <Text style={styles.bulletMark}>•</Text>
                      <Text style={styles.bulletText}>
                        <BoldText text={hl} />
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {education.length > 0 && (
          <View>
            <SectionTitle>{RESUME_SECTIONS.education}</SectionTitle>
            {education.map((edu, i) => {
              const place = formatEducationPlace(edu);
              const dates = formatEducationDates(edu);
              return (
                <View key={i} style={styles.eduHeader} wrap={false}>
                  <Text style={{ flex: 1, paddingRight: 8 }}>
                    {edu.degree ? <Text style={styles.eduDegree}>{edu.degree}</Text> : null}
                    {edu.degree && place ? (
                      <Text style={styles.eduPlace}>  —  {place}</Text>
                    ) : place ? (
                      <Text style={styles.eduPlace}>{place}</Text>
                    ) : null}
                  </Text>
                  {dates ? <Text style={styles.dates}>{dates}</Text> : null}
                </View>
              );
            })}
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function generateResumePdfBlob(data: ResumeData): Promise<Blob> {
  return pdf(<ResumePdfDocument data={data} />).toBlob();
}
