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
import {
  CALEB_COLORS,
  CALEB_PDF_FONT,
  CALEB_PDF_FONT_BOLD,
  CALEB_PDF_FONT_BOLD_ITALIC,
  CALEB_SECTIONS,
} from "@/lib/resumeStyle";
import { ResumeData } from "@/lib/types";
import { Document, Page, pdf, StyleSheet, Text, View } from "@react-pdf/renderer";

const MARGIN_X = 0.6 * 72;
const MARGIN_Y = 0.5 * 72;

const styles = StyleSheet.create({
  page: {
    paddingTop: MARGIN_Y,
    paddingBottom: MARGIN_Y,
    paddingLeft: MARGIN_X,
    paddingRight: MARGIN_X,
    color: CALEB_COLORS.body,
    fontFamily: CALEB_PDF_FONT,
  },
  name: {
    fontFamily: CALEB_PDF_FONT_BOLD,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 2,
    color: CALEB_COLORS.name,
  },
  title: {
    fontFamily: CALEB_PDF_FONT,
    fontSize: 11,
    textAlign: "center",
    marginBottom: 2,
    color: CALEB_COLORS.dark,
  },
  contact: {
    fontFamily: CALEB_PDF_FONT,
    fontSize: 10,
    textAlign: "center",
    marginBottom: 1,
    color: CALEB_COLORS.muted,
  },
  linkedin: {
    fontFamily: CALEB_PDF_FONT,
    fontSize: 10,
    textAlign: "center",
    marginBottom: 6,
    color: CALEB_COLORS.muted,
  },
  sectionTitle: {
    fontFamily: CALEB_PDF_FONT_BOLD,
    fontSize: 11,
    marginTop: 10,
    marginBottom: 2,
    color: CALEB_COLORS.dark,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: CALEB_COLORS.rule,
    marginBottom: 5,
  },
  body: {
    fontFamily: CALEB_PDF_FONT,
    fontSize: 10,
    lineHeight: 1.35,
    color: CALEB_COLORS.body,
  },
  skillLine: {
    fontFamily: CALEB_PDF_FONT,
    fontSize: 10,
    lineHeight: 1.35,
    marginBottom: 2,
  },
  skillCategory: {
    fontFamily: CALEB_PDF_FONT_BOLD,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  company: {
    fontFamily: CALEB_PDF_FONT_BOLD,
    fontSize: 10.5,
    color: CALEB_COLORS.body,
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  position: {
    fontFamily: CALEB_PDF_FONT_BOLD_ITALIC,
    fontSize: 10,
    color: CALEB_COLORS.position,
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  mutedRight: {
    fontFamily: CALEB_PDF_FONT,
    fontSize: 10,
    color: CALEB_COLORS.muted,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 2,
  },
  bulletMark: {
    width: 12,
    fontFamily: CALEB_PDF_FONT,
    fontSize: 10,
    color: CALEB_COLORS.body,
  },
  bulletText: {
    flex: 1,
    fontFamily: CALEB_PDF_FONT,
    fontSize: 10,
    lineHeight: 1.35,
    color: CALEB_COLORS.body,
  },
  bold: {
    fontFamily: CALEB_PDF_FONT_BOLD,
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

function CalebResumePdfDocument({ data }: { data: ResumeData }) {
  const personal = data.personal ?? {};
  const summary = data.summary ?? personal.summary ?? "";
  const contact = formatCalebContactLine(personal);
  const linkedin = formatCalebLinkedIn(personal);
  const skills = skillEntries(data.skills);
  const experience = data.experience ?? [];
  const education = data.education ?? [];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {personal.name && (
          <Text style={styles.name}>{toTitleCase(personal.name)}</Text>
        )}
        {personal.title ? <Text style={styles.title}>{personal.title}</Text> : null}
        {contact ? <Text style={styles.contact}>{contact}</Text> : null}
        {linkedin ? <Text style={styles.linkedin}>{linkedin}</Text> : null}

        {summary && (
          <View>
            <SectionTitle>{CALEB_SECTIONS.summary}</SectionTitle>
            <Text style={[styles.body, { marginBottom: 2 }]}>
              <BoldText text={summary} />
            </Text>
          </View>
        )}

        {skills.length > 0 && (
          <View>
            <SectionTitle>{CALEB_SECTIONS.skills}</SectionTitle>
            {skills.map(([category, items]) => (
              <Text key={category || "flat"} style={styles.skillLine}>
                {category && <Text style={styles.skillCategory}>{category}: </Text>}
                {formatCalebSkillList(items)}
              </Text>
            ))}
          </View>
        )}

        {experience.length > 0 && (
          <View>
            <SectionTitle>{CALEB_SECTIONS.experience}</SectionTitle>
            {experience.map((exp, i) => {
              const dates = formatExperienceDates(exp);
              const location = formatExperienceLocation(exp);
              const showCompany = shouldShowCompanyHeader(experience, i);
              return (
                <View key={i} wrap={false}>
                  {showCompany && (exp.company || location) && (
                    <View style={[styles.row, { marginTop: 8 }]}>
                      <Text style={styles.company}>{exp.company ?? ""}</Text>
                      {location ? <Text style={styles.mutedRight}>{location}</Text> : null}
                    </View>
                  )}
                  {(exp.position || dates) && (
                    <View
                      style={[
                        styles.row,
                        { marginTop: showCompany ? 1 : 8, marginBottom: 3 },
                      ]}
                    >
                      <Text style={styles.position}>{exp.position ?? ""}</Text>
                      {dates ? <Text style={styles.mutedRight}>{dates}</Text> : null}
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
            <SectionTitle>{CALEB_SECTIONS.education}</SectionTitle>
            {education.map((edu, i) => {
              const dates = formatEducationDates(edu);
              return (
                <View key={i} wrap={false}>
                  {(edu.institution || edu.location) && (
                    <View style={[styles.row, { marginTop: 8 }]}>
                      <Text style={styles.company}>{edu.institution ?? ""}</Text>
                      {edu.location ? (
                        <Text style={styles.mutedRight}>{edu.location}</Text>
                      ) : null}
                    </View>
                  )}
                  {(edu.degree || dates) && (
                    <View style={[styles.row, { marginTop: 1, marginBottom: 3 }]}>
                      <Text style={styles.position}>{edu.degree ?? ""}</Text>
                      {dates ? <Text style={styles.mutedRight}>{dates}</Text> : null}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function generateCalebResumePdfBlob(data: ResumeData): Promise<Blob> {
  return pdf(<CalebResumePdfDocument data={data} />).toBlob();
}
