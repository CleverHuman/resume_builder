import {
  formatContactLine,
  formatEducationMeta,
  formatExperienceMeta,
  parseBoldSegments,
  skillEntries,
} from "@/lib/resumeHelpers";
import { ResumeData } from "@/lib/types";
import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const MARGIN = 0.85 * 72; // inches -> points
const DARK = "#111111";

const styles = StyleSheet.create({
  page: {
    paddingTop: MARGIN,
    paddingBottom: MARGIN,
    paddingLeft: MARGIN,
    paddingRight: MARGIN,
    color: DARK,
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    textAlign: "center",
    marginBottom: 3,
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 6,
  },
  contact: {
    fontFamily: "Helvetica",
    fontSize: 10,
    textAlign: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    marginTop: 12,
    marginBottom: 1,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginBottom: 6,
  },
  body: {
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
  },
  skillLine: {
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 2,
  },
  skillCategory: {
    fontFamily: "Helvetica-Bold",
  },
  position: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    marginTop: 10,
    marginBottom: 1,
  },
  meta: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 10,
    marginBottom: 3,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletMark: {
    width: 14,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
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
        {personal.name && <Text style={styles.name}>{personal.name}</Text>}
        {personal.title && <Text style={styles.title}>{personal.title}</Text>}
        {contact && <Text style={styles.contact}>{contact}</Text>}

        {summary && (
          <View>
            <SectionTitle>SUMMARY</SectionTitle>
            <Text style={[styles.body, { marginBottom: 4 }]}>{summary}</Text>
          </View>
        )}

        {skills.length > 0 && (
          <View>
            <SectionTitle>TECHNICAL SKILLS</SectionTitle>
            {skills.map(([category, items]) => (
              <Text key={category || "flat"} style={styles.skillLine}>
                {category && <Text style={styles.skillCategory}>{category}: </Text>}
                {items.join(" | ")}
              </Text>
            ))}
          </View>
        )}

        {experience.length > 0 && (
          <View>
            <SectionTitle>WORK EXPERIENCE</SectionTitle>
            {experience.map((exp, i) => {
              const meta = formatExperienceMeta(exp);
              return (
                <View key={i} wrap={false}>
                  {exp.position && <Text style={styles.position}>{exp.position}</Text>}
                  {meta && <Text style={styles.meta}>{meta}</Text>}
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
            <SectionTitle>EDUCATION</SectionTitle>
            {education.map((edu, i) => {
              const meta = formatEducationMeta(edu);
              return (
                <View key={i} wrap={false}>
                  {edu.degree && <Text style={styles.position}>{edu.degree}</Text>}
                  {meta && <Text style={styles.meta}>{meta}</Text>}
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
