import {
  formatBinContactLine,
  formatBinEducationHeader,
  formatBinExperienceHeader,
  parseBoldSegments,
  skillEntries,
  toTitleCase,
} from "@/lib/resumeHelpers";
import { BIN_COLORS_HEX, BIN_FONT, BIN_SECTIONS } from "@/lib/resumeStyle";
import { ResumeData } from "@/lib/types";
import {
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  Document,
  IParagraphOptions,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

const MARGIN = convertInchesToTwip(0.7);

function sectionHeader(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 80 },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 8,
        space: 1,
        color: BIN_COLORS_HEX.rule,
      },
    },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 24,
        color: BIN_COLORS_HEX.dark,
        font: BIN_FONT,
      }),
    ],
  });
}

function styledRuns(
  text: string,
  opts: { size?: number; forceBold?: boolean; color?: string } = {}
): TextRun[] {
  const { size = 22, forceBold = false, color = BIN_COLORS_HEX.dark } = opts;
  return parseBoldSegments(text).map(
    (seg) =>
      new TextRun({
        text: seg.text,
        bold: forceBold || seg.bold,
        size,
        color,
        font: BIN_FONT,
      })
  );
}

function paragraph(options: IParagraphOptions): Paragraph {
  return new Paragraph(options);
}

export async function generateBinResumeDocxBlob(data: ResumeData): Promise<Blob> {
  const personal = data.personal ?? {};
  const summary = data.summary ?? personal.summary ?? "";
  const contact = formatBinContactLine(personal);
  const skills = skillEntries(data.skills);
  const experience = data.experience ?? [];
  const education = data.education ?? [];

  const children: Paragraph[] = [];

  if (personal.name) {
    children.push(
      paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: toTitleCase(personal.name),
            bold: true,
            size: 44,
            color: BIN_COLORS_HEX.dark,
            font: BIN_FONT,
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
            color: BIN_COLORS_HEX.muted,
            font: BIN_FONT,
          }),
        ],
      })
    );
  }

  if (summary) {
    children.push(sectionHeader(BIN_SECTIONS.summary));
    children.push(paragraph({ spacing: { after: 40 }, children: styledRuns(summary) }));
  }

  if (skills.length > 0) {
    children.push(sectionHeader(BIN_SECTIONS.skills));
    for (const [category, items] of skills) {
      const runs: TextRun[] = [];
      if (category) {
        runs.push(
          new TextRun({
            text: `${category}: `,
            bold: true,
            size: 22,
            color: BIN_COLORS_HEX.dark,
            font: BIN_FONT,
          })
        );
      }
      runs.push(
        new TextRun({
          text: items.join(" | "),
          size: 22,
          color: BIN_COLORS_HEX.dark,
          font: BIN_FONT,
        })
      );
      children.push(paragraph({ spacing: { after: 40 }, children: runs }));
    }
  }

  if (experience.length > 0) {
    children.push(sectionHeader(BIN_SECTIONS.experience));
    for (const exp of experience) {
      const header = formatBinExperienceHeader(exp);
      if (header) {
        children.push(
          paragraph({
            spacing: { before: 120, after: 40 },
            children: styledRuns(header, { forceBold: true }),
          })
        );
      }
      for (const hl of exp.highlights ?? []) {
        children.push(
          paragraph({ bullet: { level: 0 }, spacing: { after: 20 }, children: styledRuns(hl) })
        );
      }
    }
  }

  if (education.length > 0) {
    children.push(sectionHeader(BIN_SECTIONS.education));
    for (const edu of education) {
      const header = formatBinEducationHeader(edu);
      if (header) {
        children.push(
          paragraph({
            spacing: { before: 80, after: 0 },
            children: styledRuns(header, { forceBold: true }),
          })
        );
      }
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: BIN_FONT, size: 22 } },
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
