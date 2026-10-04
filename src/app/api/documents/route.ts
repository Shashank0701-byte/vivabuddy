import { extractPdfText } from "@/lib/documents/parser";

export const runtime = "nodejs";
// Keep the multipart request under Vercel Functions' 4.5 MB request-body limit.
const MAX_FILE_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Choose a PDF to upload." }, { status: 400 });
    if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) return Response.json({ error: "Please choose a PDF file." }, { status: 415 });
    if (file.size > MAX_FILE_BYTES) return Response.json({ error: "That PDF is over the 4 MB limit." }, { status: 413 });
    if (file.size === 0) return Response.json({ error: "That file is empty." }, { status: 400 });
    const text = await extractPdfText(new Uint8Array(await file.arrayBuffer()));
    if (text.length < 80) return Response.json({ error: "We could not find enough selectable text. Try a text-based PDF rather than a scanned image." }, { status: 422 });
    return Response.json({ text: text.slice(0, 80_000), fileName: file.name, truncated: text.length > 80_000 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "We couldn't read this PDF." }, { status: 500 });
  }
}
