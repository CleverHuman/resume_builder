import {
  formatContactLine,
  formatEducationMeta,
  formatExperienceMeta,
  parseBoldSegments,
  skillEntries,
} from "@/lib/resumeHelpers";
import { ResumeData } from "@/lib/types";
import {
  AlignmentType,
  BorderStyle,
  convertMillimetersToTwip,
  Document,
  IParagraphOptions,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

const DARK = "111111";
const MARGIN = convertMillimetersToTwip(21.6); // ~0.85in

function hr(): Paragraph {
  return new Paragraph({
    spacing: { before: 0, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, space: 1, color: DARK },
    },
  });
}

function sectionHeader(title: string): Paragraph[] {
  return [
    new Paragraph({
      spacing: { before: 240, after: 0 },
      children: [
        new TextRun({ text: title, bold: true, size: 26, color: DARK, font: "Calibri" }),
      ],
    }),
    hr(),
  ];
}

function styledRuns(
  text: string,
  opts: { size?: number; forceBold?: boolean; italic?: boolean } = {}
): TextRun[] {
  const { size = 20, forceBold = false, italic = false } = opts;
  return parseBoldSegments(text).map(
    (seg) =>
      new TextRun({
        text: seg.text,
        bold: forceBold || seg.bold,
        italics: italic,
        size,
        color: DARK,
        font: "Calibri",
      })
  );
}

function paragraph(options: IParagraphOptions): Paragraph {
  return new Paragraph(options);
}

export async function generateResumeDocxBlob(data: ResumeData): Promise<Blob> {
  const personal = data.personal ?? {};
  const summary = data.summary ?? personal.summary ?? "";
  const contact = formatContactLine(personal);
  const skills = skillEntries(data.skills);
  const experience = data.experience ?? [];
  const education = data.education ?? [];

  const children: Paragraph[] = [];

  if (personal.name) {
    children.push(
      paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({ text: personal.name, bold: true, size: 44, color: DARK, font: "Calibri" }),
        ],
      })
    );
  }

  if (personal.title) {
    children.push(
      paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({ text: personal.title, bold: true, size: 26, color: DARK, font: "Calibri" }),
        ],
      })
    );
  }

  if (contact) {
    children.push(
      paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: contact, size: 20, color: DARK, font: "Calibri" })],
      })
    );
  }

  if (summary) {
    children.push(...sectionHeader("SUMMARY"));
    children.push(
      paragraph({ spacing: { after: 80 }, children: styledRuns(summary) })
    );
  }

  if (skills.length > 0) {
    children.push(...sectionHeader("TECHNICAL SKILLS"));
    for (const [category, items] of skills) {
      const runs: TextRun[] = [];
      if (category) {
        runs.push(
          new TextRun({ text: `${category}: `, bold: true, size: 20, color: DARK, font: "Calibri" })
        );
      }
      runs.push(new TextRun({ text: items.join(" | "), size: 20, color: DARK, font: "Calibri" }));
      children.push(paragraph({ spacing: { after: 40 }, children: runs }));
    }
  }

  if (experience.length > 0) {
    children.push(...sectionHeader("WORK EXPERIENCE"));
    for (const exp of experience) {
      if (exp.position) {
        children.push(
          paragraph({
            spacing: { before: 160, after: 20 },
            children: styledRuns(exp.position, { size: 21, forceBold: true }),
          })
        );
      }
      const meta = formatExperienceMeta(exp);
      if (meta) {
        children.push(
          paragraph({ spacing: { after: 60 }, children: styledRuns(meta, { italic: true }) })
        );
      }
      for (const hl of exp.highlights ?? []) {
        children.push(
          paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: styledRuns(hl) })
        );
      }
    }
  }

  if (education.length > 0) {
    children.push(...sectionHeader("EDUCATION"));
    for (const edu of education) {
      if (edu.degree) {
        children.push(
          paragraph({
            spacing: { before: 120, after: 20 },
            children: styledRuns(edu.degree, { size: 21, forceBold: true }),
          })
        );
      }
      const meta = formatEducationMeta(edu);
      if (meta) {
        children.push(
          paragraph({
            spacing: { after: 0 },
            children: styledRuns(meta, { italic: true }),
          })
        );
      }
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 20 } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}
