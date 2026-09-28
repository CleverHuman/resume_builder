import {
  formatBinContactLine,
  formatBinEducationHeader,
  formatBinExperienceHeader,
  parseBoldSegments,
  skillEntries,
  toTitleCase,
} from "@/lib/resumeHelpers";
import {
  BIN_COLORS,
  BIN_PDF_FONT,
  BIN_PDF_FONT_BOLD,
  BIN_SECTIONS,
} from "@/lib/resumeStyle";
import { ResumeData } from "@/lib/types";
import { Document, Page, pdf, StyleSheet, Text, View } from "@react-pdf/renderer";

const MARGIN = 0.7 * 72;

const styles = StyleSheet.create({
  page: {
    paddingTop: MARGIN,
    paddingBottom: MARGIN,
    paddingLeft: MARGIN,
    paddingRight: MARGIN,
    color: BIN_COLORS.dark,
    fontFamily: BIN_PDF_FONT,
  },
  name: {
    fontFamily: BIN_PDF_FONT_BOLD,
    fontSize: 22,
    textAlign: "center",
    marginBottom: 3,
  },
  contact: {
    fontFamily: BIN_PDF_FONT,
    fontSize: 10,
    textAlign: "center",
    marginBottom: 8,
    color: BIN_COLORS.muted,
  },
  sectionTitle: {
    fontFamily: BIN_PDF_FONT_BOLD,
    fontSize: 12,
    marginTop: 12,
    marginBottom: 1,
    textTransform: "uppercase",
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: BIN_COLORS.rule,
    marginBottom: 6,
  },
  body: {
    fontFamily: BIN_PDF_FONT,
    fontSize: 11,
    lineHeight: 1.35,
  },
  skillLine: {
    fontFamily: BIN_PDF_FONT,
    fontSize: 11,
    lineHeight: 1.35,
    marginBottom: 2,
  },
  skillCategory: {
    fontFamily: BIN_PDF_FONT_BOLD,
  },
  headerLine: {
    fontFamily: BIN_PDF_FONT_BOLD,
    fontSize: 11,
    marginTop: 8,
    marginBottom: 2,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 1,
  },
  bulletMark: {
    width: 12,
    fontFamily: BIN_PDF_FONT,
    fontSize: 11,
  },
  bulletText: {
    flex: 1,
    fontFamily: BIN_PDF_FONT,
    fontSize: 11,
    lineHeight: 1.35,
  },
  bold: {
    fontFamily: BIN_PDF_FONT_BOLD,
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

function BinResumePdfDocument({ data }: { data: ResumeData }) {
  const personal = data.personal ?? {};
  const summary = data.summary ?? personal.summary ?? "";
  const contact = formatBinContactLine(personal);
  const skills = skillEntries(data.skills);
  const experience = data.experience ?? [];
  const education = data.education ?? [];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {personal.name && <Text style={styles.name}>{toTitleCase(personal.name)}</Text>}
        {contact && <Text style={styles.contact}>{contact}</Text>}

        {summary && (
          <View>
            <SectionTitle>{BIN_SECTIONS.summary}</SectionTitle>
            <Text style={[styles.body, { marginBottom: 2, textAlign: "justify" }]}>
              <BoldText text={summary} />
            </Text>
          </View>
        )}

        {skills.length > 0 && (
          <View>
            <SectionTitle>{BIN_SECTIONS.skills}</SectionTitle>
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
            <SectionTitle>{BIN_SECTIONS.experience}</SectionTitle>
            {experience.map((exp, i) => {
              const header = formatBinExperienceHeader(exp);
              return (
                <View key={i} wrap={false}>
                  {header ? <Text style={styles.headerLine}>{header}</Text> : null}
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
            <SectionTitle>{BIN_SECTIONS.education}</SectionTitle>
            {education.map((edu, i) => {
              const header = formatBinEducationHeader(edu);
              return header ? (
                <Text key={i} style={styles.headerLine}>
                  {header}
                </Text>
              ) : null;
            })}
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function generateBinResumePdfBlob(data: ResumeData): Promise<Blob> {
  return pdf(<BinResumePdfDocument data={data} />).toBlob();
}
