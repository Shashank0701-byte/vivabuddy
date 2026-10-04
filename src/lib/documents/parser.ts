import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { PDFParse } from "pdf-parse";

const require = createRequire(`${process.cwd()}/package.json`);
const pdfWorkerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");

// pdf.js otherwise guesses a worker path relative to Next's generated route chunk.
// That path does not exist in either the dev server or standalone production output.
PDFParse.setWorker(pathToFileURL(pdfWorkerPath).href);

export async function extractPdfText(bytes: Uint8Array) {
  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText();
    return result.text.replace(/\s+/g, " ").trim();
  } finally {
    await parser.destroy();
  }
}
