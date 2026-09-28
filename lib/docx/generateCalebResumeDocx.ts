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
import { CALEB_COLORS_HEX, CALEB_FONT, CALEB_SECTIONS } from "@/lib/resumeStyle";
import { ResumeData } from "@/lib/types";
import {
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  Document,
  IParagraphOptions,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

const MARGIN_X = convertInchesToTwip(0.6);
const MARGIN_Y = convertInchesToTwip(0.5);
const BULLET_REF = "caleb-bullets";

function sectionHeader(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 6,
        space: 2,
        color: CALEB_COLORS_HEX.rule,
      },
    },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 22,
        color: CALEB_COLORS_HEX.dark,
        font: CALEB_FONT,
      }),
    ],
  });
}

function styledRuns(
  text: string,
  opts: { size?: number; forceBold?: boolean; color?: string } = {}
): TextRun[] {
  const { size = 20, forceBold = false, color = CALEB_COLORS_HEX.body } = opts;
  return parseBoldSegments(text).map(
    (seg) =>
      new TextRun({
        text: seg.text,
        bold: forceBold || seg.bold,
        size,
        color,
        font: CALEB_FONT,
      })
  );
}

function paragraph(options: IParagraphOptions): Paragraph {
  return new Paragraph(options);
}

function spacedRow(
  leftRuns: TextRun[],
  rightText: string | undefined,
  spacing: { before?: number; after?: number }
): Paragraph {
  const runs = [...leftRuns];
  if (rightText) {
    runs.push(
      new TextRun({
        text: `  |  ${rightText}`,
        size: 20,
        color: CALEB_COLORS_HEX.muted,
        font: CALEB_FONT,
      })
    );
  }
  return paragraph({
    spacing,
    children: runs,
  });
}

export async function generateCalebResumeDocxBlob(data: ResumeData): Promise<Blob> {
  const personal = data.personal ?? {};
  const summary = data.summary ?? personal.summary ?? "";
  const contact = formatCalebContactLine(personal);
  const linkedin = formatCalebLinkedIn(personal);
  const skills = skillEntries(data.skills);
  const experience = data.experience ?? [];
  const education = data.education ?? [];

  const children: Paragraph[] = [];

  if (personal.name) {
    children.push(
      paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: personal.title ? 20 : 40 },
        children: [
          new TextRun({
            text: toTitleCase(personal.name),
            bold: true,
            size: 40,
            color: CALEB_COLORS_HEX.name,
            font: CALEB_FONT,
          }),
        ],
      })
    );
  }

  if (personal.title) {
    children.push(
      paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: personal.title,
            size: 22,
            color: CALEB_COLORS_HEX.dark,
            font: CALEB_FONT,
          }),
        ],
      })
    );
  }

  if (contact) {
    children.push(
      paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: contact,
            size: 20,
            color: CALEB_COLORS_HEX.muted,
            font: CALEB_FONT,
          }),
        ],
      })
    );
  }

  if (linkedin) {
    children.push(
      paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: linkedin,
            size: 20,
            color: CALEB_COLORS_HEX.muted,
            font: CALEB_FONT,
          }),
        ],
      })
    );
  }

  if (summary) {
    children.push(sectionHeader(CALEB_SECTIONS.summary));
    children.push(
      paragraph({
        spacing: { after: 40 },
        children: styledRuns(summary, { size: 20 }),
      })
    );
  }

  if (skills.length > 0) {
    children.push(sectionHeader(CALEB_SECTIONS.skills));
    for (const [category, items] of skills) {
      const runs: TextRun[] = [];
      if (category) {
        runs.push(
          new TextRun({
            text: `${category}: `,
            bold: true,
            size: 20,
            color: CALEB_COLORS_HEX.body,
            font: CALEB_FONT,
          })
        );
      }
      runs.push(
        new TextRun({
          text: formatCalebSkillList(items),
          size: 20,
          color: CALEB_COLORS_HEX.body,
          font: CALEB_FONT,
        })
      );
      children.push(paragraph({ spacing: { after: 40 }, children: runs }));
    }
  }

  if (experience.length > 0) {
    children.push(sectionHeader(CALEB_SECTIONS.experience));
    for (let i = 0; i < experience.length; i++) {
      const exp = experience[i];
      const dates = formatExperienceDates(exp);
      const location = formatExperienceLocation(exp);
      const showCompany = shouldShowCompanyHeader(experience, i);

      if (showCompany && (exp.company || location)) {
        children.push(
          spacedRow(
            [
              new TextRun({
                text: exp.company ?? "",
                bold: true,
                size: 21,
                color: CALEB_COLORS_HEX.body,
                font: CALEB_FONT,
              }),
            ],
            location || undefined,
            { before: 160, after: 0 }
          )
        );
      }

      if (exp.position || dates) {
        children.push(
          spacedRow(
            [
              new TextRun({
                text: exp.position ?? "",
                bold: true,
                italics: true,
                size: 20,
                color: CALEB_COLORS_HEX.position,
                font: CALEB_FONT,
              }),
            ],
            dates || undefined,
            { before: showCompany ? 20 : 160, after: 60 }
          )
        );
      }

      for (const hl of exp.highlights ?? []) {
        children.push(
          paragraph({
            numbering: { reference: BULLET_REF, level: 0 },
            spacing: { after: 40 },
            children: styledRuns(hl, { size: 20 }),
          })
        );
      }
    }
  }

  if (education.length > 0) {
    children.push(sectionHeader(CALEB_SECTIONS.education));
    for (const edu of education) {
      const dates = formatEducationDates(edu);

      if (edu.institution || edu.location) {
        children.push(
          spacedRow(
            [
              new TextRun({
                text: edu.institution ?? "",
                bold: true,
                size: 21,
                color: CALEB_COLORS_HEX.body,
                font: CALEB_FONT,
              }),
            ],
            edu.location || undefined,
            { before: 160, after: 0 }
          )
        );
      }

      if (edu.degree || dates) {
        children.push(
          spacedRow(
            [
              new TextRun({
                text: edu.degree ?? "",
                bold: true,
                italics: true,
                size: 20,
                color: CALEB_COLORS_HEX.position,
                font: CALEB_FONT,
              }),
            ],
            dates || undefined,
            { before: 20, after: 60 }
          )
        );
      }
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: CALEB_FONT, size: 20, color: CALEB_COLORS_HEX.body },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: BULLET_REF,
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.125) },
                },
                run: {
                  color: CALEB_COLORS_HEX.body,
                  font: CALEB_FONT,
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: MARGIN_Y,
              bottom: MARGIN_Y,
              left: MARGIN_X,
              right: MARGIN_X,
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}
