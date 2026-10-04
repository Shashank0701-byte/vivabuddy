import { ollama } from "@/lib/ai/client";

export async function askForJson<T>(system: string, prompt: string): Promise<T> {
  const model = process.env.OLLAMA_MODEL || "qwen2.5-coder:7b";
  let content: string;

  try {
    const response = await ollama.chat({
      model,
      format: "json",
      stream: false,
      messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
      options: { temperature: 0.4 },
    });
    content = response.message.content;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown Ollama error";
    throw new Error(`Could not get a response from Ollama (${model}). Make sure Ollama is running and the model is installed. ${detail}`);
  }

  // Some models return valid JSON wrapped in Markdown despite JSON mode.
  const normalized = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  const objectStart = normalized.indexOf("{");
  const objectEnd = normalized.lastIndexOf("}");
  const json = objectStart >= 0 && objectEnd > objectStart
    ? normalized.slice(objectStart, objectEnd + 1)
    : normalized;

  try {
    return JSON.parse(json) as T;
  } catch {
    throw new Error(`Ollama (${model}) returned a response that was not valid JSON. Please try again.`);
  }
}
