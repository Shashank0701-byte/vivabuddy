import { z } from "zod";
import { askForJson } from "@/lib/ai/ollama";
import { QUESTION_SYSTEM } from "@/lib/ai/prompts";

const Input = z.object({ material: z.string().min(80).max(80_000), subject: z.string().trim().min(2).max(100), difficulty: z.enum(["easy", "medium", "hard"]), previousQuestions: z.array(z.string().max(800)).max(10).default([]) });
const Output = z.object({ question: z.string().min(5), topic: z.string().min(2) });

export async function POST(request: Request) {
  try {
    const parsed = Input.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Add study material, a subject, and a difficulty to begin." }, { status: 400 });
    const result = Output.parse(await askForJson(QUESTION_SYSTEM, JSON.stringify(parsed.data)));
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not start the viva." }, { status: 503 });
  }
}
