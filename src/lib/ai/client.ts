import { Ollama } from "ollama";

const apiKey = process.env.OLLAMA_API_KEY;

export const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
  ...(apiKey ? { headers: { Authorization: `Bearer ${apiKey}` } } : {}),
});
