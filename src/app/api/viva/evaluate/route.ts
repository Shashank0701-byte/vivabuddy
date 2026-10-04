import { z } from "zod";
import { askForJson } from "@/lib/ai/ollama";
import { REPORT_SYSTEM } from "@/lib/ai/prompts";

const Input = z.object({ subject: z.string().min(2).max(100), answers: z.array(z.object({ question: z.string(), answer: z.string(), evaluation: z.object({ score: z.number(), feedback: z.string(), missingConcepts: z.array(z.string()) }) })).min(1).max(5) });
const Output = z.object({ overallScore: z.number().int().min(0).max(100), categories: z.object({ conceptualUnderstanding: z.number().int().min(0).max(100), technicalAccuracy: z.number().int().min(0).max(100), depth: z.number().int().min(0).max(100) }), strengths: z.array(z.string()).max(4), weakAreas: z.array(z.string()).max(4), recommendations: z.array(z.string()).max(4) });

export async function POST(request: Request) {
  try {
    const parsed = Input.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "There isn't enough session data to make a report." }, { status: 400 });
    const result = Output.parse(await askForJson(REPORT_SYSTEM, JSON.stringify(parsed.data)));
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not make the final report." }, { status: 503 });
  }
}
