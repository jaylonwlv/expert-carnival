import fs from "node:fs";
import path from "node:path";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// StandardFonts.Helvetica only supports WinAnsi (Windows-1252) encoding,
// any signer name or typed field value outside that (Vietnamese diacritics,
// Cyrillic, CJK, emoji) made drawText throw, so a real class of legitimate
// names could never complete signing at all. A bundled Unicode font fixes
// that. `subset: false` (the default, deliberately not overridden) is
// load-bearing, not just unused: pdf-lib's font-subsetting path was tested
// directly against this exact font and silently dropped several glyphs
// (Vietnamese tone marks, full Cyrillic words) without throwing, which is
// worse than Helvetica's crash, it would have shipped a signed PDF
// quietly missing characters from the signer's own name. Unsubsetted, the
// same glyphs render correctly (verified directly, not assumed), at the
// cost of embedding the full ~2MB font in every signed PDF.
const FONT_PATH = path.join(process.cwd(), "src", "fonts", "NotoSans-Regular.ttf");
const FONT_BYTES = fs.readFileSync(FONT_PATH);

export type SignatureFieldType = "signature" | "initials" | "date" | "time" | "text" | "checkbox";

export type FieldToStamp = {
  type: SignatureFieldType;
  page: number; // 0-indexed
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  value: string | null;
};

export type AuditInfo = {
  signerName: string;
  signedAt: Date;
  signedIp: string | null;
  documentFilename: string;
};

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Buffer.from(base64, "base64");
}

// Converts a field's web-style box (origin top-left, y grows down, all in
// 0-1 fractions of the page) into pdf-lib's point coordinates (origin
// bottom-left) for a page of the given real size.
function toPdfBox(field: FieldToStamp, pageWidth: number, pageHeight: number) {
  const x = field.xPct * pageWidth;
  const width = field.widthPct * pageWidth;
  const height = field.heightPct * pageHeight;
  const topFromTop = field.yPct * pageHeight;
  const y = pageHeight - topFromTop - height;
  return { x, y, width, height };
}

export async function stampSignedPdf(
  sourcePdfBytes: Uint8Array,
  fields: FieldToStamp[],
  audit: AuditInfo
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(sourcePdfBytes);
  pdfDoc.registerFontkit(fontkit);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(FONT_BYTES);

  for (const field of fields) {
    const page = pages[field.page];
    if (!page) {
      // A field's page index not matching the document's actual page count
      // is a data-integrity problem (the stored file doesn't match what the
      // field layout assumed), not a normal "field left blank" case, it
      // was previously lumped in with the !field.value check below and
      // silently skipped, which let a signed PDF ship with a required mark
      // quietly missing and nothing in the audit trail saying so.
      throw new Error(
        `Field references page ${field.page + 1}, but the document only has ${pages.length} page(s)`
      );
    }
    if (!field.value) continue;

    const { width: pageWidth, height: pageHeight } = page.getSize();
    const { x, y, width, height } = toPdfBox(field, pageWidth, pageHeight);

    if (field.type === "signature" || field.type === "initials") {
      if (!field.value.startsWith("data:image/")) continue;
      const image = await pdfDoc.embedPng(dataUrlToBytes(field.value));
      page.drawImage(image, { x, y, width, height });
    } else if (field.type === "checkbox") {
      if (field.value === "true") {
        page.drawText("X", {
          x: x + width * 0.15,
          y: y + height * 0.15,
          size: Math.min(height * 0.8, 14),
          font,
          color: rgb(0, 0, 0),
        });
      }
    } else {
      // date | time | text
      const fontSize = Math.min(height * 0.7, 12);
      page.drawText(field.value, {
        x: x + 2,
        y: y + height * 0.25,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    }
  }

  // Audit/certificate page, the part of RabbitSign's "audit trail on every
  // signed document" feature that's independent of where fields were placed.
  const auditPage = pdfDoc.addPage();
  const { height: auditPageHeight } = auditPage.getSize();
  const lines = [
    "Signature Certificate",
    "",
    `Document: ${audit.documentFilename}`,
    `Signed by: ${audit.signerName}`,
    `Signed at: ${audit.signedAt.toUTCString()}`,
    `IP address: ${audit.signedIp ?? "unknown"}`,
    "",
    "By signing, the signer agreed this constitutes a legally binding electronic signature.",
  ];
  lines.forEach((line, i) => {
    auditPage.drawText(line, {
      x: 50,
      y: auditPageHeight - 80 - i * 20,
      size: i === 0 ? 16 : 11,
      font,
      color: rgb(0, 0, 0),
    });
  });

  return pdfDoc.save();
}
