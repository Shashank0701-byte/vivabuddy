import { ollama } from "@/lib/ai/client";

export async function askForJson<T>(system: string, prompt: string): Promise<T> {
  const model = process.env.OLLAMA_MODEL || "qwen2.5-coder:7b";
  try {
    const response = await ollama.chat({
      model,
      format: "json",
      stream: false,
      messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
      options: { temperature: 0.4 },
    });
    return JSON.parse(response.message.content) as T;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown Ollama error";
    throw new Error(`Could not get a response from Ollama (${model}). Make sure Ollama is running and the model is installed. ${detail}`);
  }
}
