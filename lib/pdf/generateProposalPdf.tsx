import { Document, Page, pdf, StyleSheet, Text } from "@react-pdf/renderer";

const MARGIN = 0.85 * 72; // inches -> points

const styles = StyleSheet.create({
  page: {
    paddingTop: MARGIN,
    paddingBottom: MARGIN,
    paddingLeft: MARGIN,
    paddingRight: MARGIN,
    color: "#111111",
  },
  paragraph: {
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 12,
  },
});

/** Split on blank-line runs so paragraph gaps render reliably in the PDF. */
function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function ProposalPdfDocument({ text }: { text: string }) {
  const paragraphs = splitParagraphs(text);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {paragraphs.map((para, i) => (
          <Text key={i} style={styles.paragraph}>
            {para}
          </Text>
        ))}
      </Page>
    </Document>
  );
}

export async function generateProposalPdfBlob(text: string): Promise<Blob> {
  return pdf(<ProposalPdfDocument text={text} />).toBlob();
}
