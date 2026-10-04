import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { DOMMatrix } from "@napi-rs/canvas";

const require = createRequire(`${process.cwd()}/package.json`);
const pdfWorkerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");

// pdf.js evaluates DOMMatrix at module load. Node on Vercel does not provide it,
// so install the Node canvas implementation before loading pdf-parse/pdfjs.
const nodeGlobals = globalThis as unknown as { DOMMatrix?: typeof DOMMatrix };
nodeGlobals.DOMMatrix ??= DOMMatrix;

export async function extractPdfText(bytes: Uint8Array) {
  // Keep this import lazy so the DOMMatrix polyfill is set before pdf.js loads.
  const { PDFParse } = await import("pdf-parse");
  // pdf.js otherwise guesses a worker path beside Next's generated route chunk.
  PDFParse.setWorker(pathToFileURL(pdfWorkerPath).href);

  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText();
    return result.text.replace(/\s+/g, " ").trim();
  } finally {
    await parser.destroy();
  }
}
