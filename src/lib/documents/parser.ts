import { PDFParse } from "pdf-parse";

export async function extractPdfText(bytes: Uint8Array) {
  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText();
    return result.text.replace(/\s+/g, " ").trim();
  } finally {
    await parser.destroy();
  }
}
