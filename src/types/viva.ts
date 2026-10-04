export type Difficulty = "easy" | "medium" | "hard";
export type VivaQuestion = { question: string; topic: string };
export type Evaluation = { score: number; feedback: string; missingConcepts: string[]; followUp: string | null };
export type AnswerRecord = { question: string; topic: string; answer: string; evaluation: Evaluation };
export type VivaSession = { id: string; subject: string; difficulty: Difficulty; material: string; fileName: string; question: VivaQuestion; answers: AnswerRecord[]; createdAt: string };
export type VivaReport = { overallScore: number; categories: { conceptualUnderstanding: number; technicalAccuracy: number; depth: number }; strengths: string[]; weakAreas: string[]; recommendations: string[] };
