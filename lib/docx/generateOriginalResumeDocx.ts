import {
  formatEducationMeta,
  formatExperienceMeta,
  formatOriginalContactLine,
  parseBoldSegments,
  skillEntries,
} from "@/lib/resumeHelpers";
import { ORIGINAL_COLORS_HEX, ORIGINAL_FONT, ORIGINAL_SECTIONS } from "@/lib/resumeStyle";
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

const MARGIN = convertMillimetersToTwip(21.6);

function hr(): Paragraph {
  return new Paragraph({
    spacing: { before: 0, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, space: 1, color: ORIGINAL_COLORS_HEX.dark },
    },
  });
}

function sectionHeader(title: string): Paragraph[] {
  return [
    new Paragraph({
      spacing: { before: 240, after: 0 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 26,
          color: ORIGINAL_COLORS_HEX.dark,
          font: ORIGINAL_FONT,
        }),
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
        color: ORIGINAL_COLORS_HEX.dark,
        font: ORIGINAL_FONT,
      })
  );
}

function paragraph(options: IParagraphOptions): Paragraph {
  return new Paragraph(options);
}

export async function generateOriginalResumeDocxBlob(data: ResumeData): Promise<Blob> {
  const personal = data.personal ?? {};
  const summary = data.summary ?? personal.summary ?? "";
  const contact = formatOriginalContactLine(personal);
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
          new TextRun({
            text: personal.name,
            bold: true,
            size: 44,
            color: ORIGINAL_COLORS_HEX.dark,
            font: ORIGINAL_FONT,
          }),
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
          new TextRun({
            text: personal.title,
            bold: true,
            size: 26,
            color: ORIGINAL_COLORS_HEX.dark,
            font: ORIGINAL_FONT,
          }),
        ],
      })
    );
  }

  if (contact) {
    children.push(
      paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: contact,
            size: 20,
            color: ORIGINAL_COLORS_HEX.dark,
            font: ORIGINAL_FONT,
          }),
        ],
      })
    );
  }

  if (summary) {
    children.push(...sectionHeader(ORIGINAL_SECTIONS.summary));
    children.push(paragraph({ spacing: { after: 80 }, children: styledRuns(summary) }));
  }

  if (skills.length > 0) {
    children.push(...sectionHeader(ORIGINAL_SECTIONS.skills));
    for (const [category, items] of skills) {
      const runs: TextRun[] = [];
      if (category) {
        runs.push(
          new TextRun({
            text: `${category}: `,
            bold: true,
            size: 20,
            color: ORIGINAL_COLORS_HEX.dark,
            font: ORIGINAL_FONT,
          })
        );
      }
      runs.push(
        new TextRun({
          text: items.join(" | "),
          size: 20,
          color: ORIGINAL_COLORS_HEX.dark,
          font: ORIGINAL_FONT,
        })
      );
      children.push(paragraph({ spacing: { after: 40 }, children: runs }));
    }
  }

  if (experience.length > 0) {
    children.push(...sectionHeader(ORIGINAL_SECTIONS.experience));
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
    children.push(...sectionHeader(ORIGINAL_SECTIONS.education));
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
        document: { run: { font: ORIGINAL_FONT, size: 20 } },
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
