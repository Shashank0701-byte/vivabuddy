import { z } from "zod";
import { askForJson } from "@/lib/ai/ollama";
import { EVALUATION_SYSTEM } from "@/lib/ai/prompts";

const Input = z.object({ material: z.string().min(80).max(80_000), subject: z.string().min(2).max(100), difficulty: z.enum(["easy", "medium", "hard"]), question: z.string().min(5).max(800), answer: z.string().trim().min(2).max(6000), previousQuestions: z.array(z.string().max(800)).max(10).default([]) });
const Output = z.object({ score: z.number().int().min(0).max(10), feedback: z.string().min(3).max(1200), missingConcepts: z.array(z.string().max(200)).max(4), followUp: z.string().max(800).nullable() });

export async function POST(request: Request) {
  try {
    const parsed = Input.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Write an answer before submitting." }, { status: 400 });
    const result = Output.parse(await askForJson(EVALUATION_SYSTEM, JSON.stringify(parsed.data)));
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not evaluate this answer." }, { status: 503 });
  }
}
