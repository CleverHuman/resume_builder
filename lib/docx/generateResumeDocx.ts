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
import { RESUME_COLORS_HEX, RESUME_FONT, RESUME_SECTIONS } from "@/lib/resumeStyle";
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
  TabStopType,
  TextRun,
} from "docx";

const MARGIN_X = convertInchesToTwip(0.75);
const MARGIN_Y = convertInchesToTwip(0.59);
const CONTENT_WIDTH = convertInchesToTwip(8.5) - MARGIN_X * 2;
const BULLET_REF = "resume-blue-bullets";

function sectionHeader(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 80 },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 6,
        space: 2,
        color: RESUME_COLORS_HEX.accent,
      },
    },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 26,
        color: RESUME_COLORS_HEX.accent,
        font: RESUME_FONT,
      }),
    ],
  });
}

function styledRuns(
  text: string,
  opts: {
    size?: number;
    forceBold?: boolean;
    italic?: boolean;
    color?: string;
  } = {}
): TextRun[] {
  const {
    size = 24,
    forceBold = false,
    italic = false,
    color = RESUME_COLORS_HEX.dark,
  } = opts;
  return parseBoldSegments(text).map(
    (seg) =>
      new TextRun({
        text: seg.text,
        bold: forceBold || seg.bold,
        italics: italic,
        size,
        color,
        font: RESUME_FONT,
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
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: personal.name.toUpperCase(),
            bold: true,
            size: 44,
            color: RESUME_COLORS_HEX.dark,
            font: RESUME_FONT,
          }),
        ],
      })
    );
  }

  if (personal.title) {
    children.push(
      paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: personal.title,
            size: 26,
            color: RESUME_COLORS_HEX.accent,
            font: RESUME_FONT,
          }),
        ],
      })
    );
  }

  if (contact) {
    children.push(
      paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: contact,
            size: 22,
            color: RESUME_COLORS_HEX.muted,
            font: RESUME_FONT,
          }),
        ],
      })
    );
  }

  if (summary) {
    children.push(sectionHeader(RESUME_SECTIONS.summary));
    children.push(
      paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { after: 60 },
        children: styledRuns(summary, { size: 24 }),
      })
    );
  }

  if (skills.length > 0) {
    children.push(sectionHeader(RESUME_SECTIONS.skills));
    for (const [category, items] of skills) {
      const runs: TextRun[] = [];
      if (category) {
        runs.push(
          new TextRun({
            text: `${category}: `,
            bold: true,
            size: 24,
            color: RESUME_COLORS_HEX.dark,
            font: RESUME_FONT,
          })
        );
      }
      runs.push(
        new TextRun({
          text: formatSkillList(items),
          size: 24,
          color: RESUME_COLORS_HEX.dark,
          font: RESUME_FONT,
        })
      );
      children.push(paragraph({ spacing: { after: 40 }, children: runs }));
    }
  }

  if (experience.length > 0) {
    children.push(sectionHeader(RESUME_SECTIONS.experience));
    for (const exp of experience) {
      const dates = formatExperienceDates(exp);
      const location = formatExperienceLocation(exp);

      if (exp.position || dates) {
        const runs: TextRun[] = [];
        if (exp.position) {
          runs.push(
            new TextRun({
              text: exp.position,
              bold: true,
              size: 25,
              color: RESUME_COLORS_HEX.dark,
              font: RESUME_FONT,
            })
          );
        }
        if (dates) {
          runs.push(new TextRun({ text: "\t", font: RESUME_FONT }));
          runs.push(
            new TextRun({
              text: dates,
              size: 23,
              color: RESUME_COLORS_HEX.muted,
              font: RESUME_FONT,
            })
          );
        }
        children.push(
          paragraph({
            spacing: { before: 120, after: 20 },
            tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
            children: runs,
          })
        );
      }

      if (exp.company || location) {
        const runs: TextRun[] = [];
        if (exp.company) {
          runs.push(
            new TextRun({
              text: exp.company,
              bold: true,
              size: 24,
              color: RESUME_COLORS_HEX.accent,
              font: RESUME_FONT,
            })
          );
        }
        if (exp.company && location) {
          runs.push(
            new TextRun({
              text: " | ",
              size: 23,
              color: RESUME_COLORS_HEX.muted,
              font: RESUME_FONT,
            })
          );
        }
        if (location) {
          runs.push(
            new TextRun({
              text: location,
              size: 23,
              color: RESUME_COLORS_HEX.muted,
              font: RESUME_FONT,
            })
          );
        }
        children.push(paragraph({ spacing: { after: 40 }, children: runs }));
      }

      for (const hl of exp.highlights ?? []) {
        children.push(
          paragraph({
            numbering: { reference: BULLET_REF, level: 0 },
            spacing: { after: 40 },
            children: styledRuns(hl, { size: 24 }),
          })
        );
      }
    }
  }

  if (education.length > 0) {
    children.push(sectionHeader(RESUME_SECTIONS.education));
    for (const edu of education) {
      const place = formatEducationPlace(edu);
      const dates = formatEducationDates(edu);
      const runs: TextRun[] = [];

      if (edu.degree) {
        runs.push(
          new TextRun({
            text: edu.degree,
            bold: true,
            size: 24,
            color: RESUME_COLORS_HEX.dark,
            font: RESUME_FONT,
          })
        );
      }
      if (place) {
        runs.push(
          new TextRun({
            text: edu.degree ? `  —  ${place}` : place,
            size: 23,
            color: RESUME_COLORS_HEX.muted,
            font: RESUME_FONT,
          })
        );
      }
      if (dates) {
        runs.push(new TextRun({ text: "\t", font: RESUME_FONT }));
        runs.push(
          new TextRun({
            text: dates,
            size: 23,
            color: RESUME_COLORS_HEX.muted,
            font: RESUME_FONT,
          })
        );
      }

      children.push(
        paragraph({
          spacing: { before: 80, after: 0 },
          tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
          children: runs,
        })
      );
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: RESUME_FONT, size: 24, color: RESUME_COLORS_HEX.dark },
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
                  indent: { left: convertInchesToTwip(0.19), hanging: convertInchesToTwip(0.14) },
                },
                run: {
                  color: RESUME_COLORS_HEX.accent,
                  font: RESUME_FONT,
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
