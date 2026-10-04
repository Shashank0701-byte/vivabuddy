import { ollama } from "@/lib/ai/client";

export async function GET() {
  try {
    const tags = await ollama.list();
    const model = process.env.OLLAMA_MODEL || "qwen2.5-coder:7b";
    const installed = tags.models.some((item) => item.name === model || item.name.startsWith(`${model}:`));
    return Response.json({ ok: true, model, installed, ollama: true }, { status: installed ? 200 : 503 });
  } catch {
    return Response.json({ ok: false, ollama: false, model: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b" }, { status: 503 });
  }
}
