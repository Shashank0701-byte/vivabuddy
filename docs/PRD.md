# VivaBuddy — Product Requirements Document

## 1. Product Overview

**VivaBuddy** is a local AI-powered viva practice tool that simulates a university oral examination using a student's own study material.

The MVP is intentionally scoped to be buildable in approximately **6 hours** for the Hacktoberfest 2026 Launch Weekend challenge.

### One-line pitch

> VivaBuddy is a local AI viva examiner that lets students practice an oral exam using their own study material, with adaptive follow-up questions and instant feedback.

---

## 2. Problem Statement

Students can revise notes, watch lectures, and solve MCQs, but practicing an actual viva is difficult.

A student preparing for a viva needs:

- Someone to ask realistic questions.
- Follow-up questions based on their answers.
- Questions grounded in their own syllabus/material.
- Feedback on conceptual gaps.
- A way to identify weak topics before the real examination.

VivaBuddy provides a lightweight, private way to practice this process using an open-weight AI model running locally.

---

## 3. Target User

### Primary user

A college/university student preparing for an upcoming viva.

### Initial real-world user

One actual friend/classmate preparing for a viva. The project should be tested with this person and their feedback should be included in the Hacktoberfest submission.

---

## 4. Goals

### Primary goals

1. Allow a student to upload study material.
2. Generate viva questions grounded in that material.
3. Allow the student to answer questions.
4. Evaluate answers using an open-weight AI model.
5. Generate adaptive follow-up questions.
6. Conduct a short 5-question viva.
7. Produce a useful final performance report.
8. Keep the student's study material and answers local during AI inference.

### Secondary goals

- Make the experience feel like a real oral examination.
- Keep the interface simple enough to understand immediately.
- Produce a polished demo suitable for the Hacktoberfest submission.

---

## 5. Non-Goals

The following are explicitly outside the MVP:

- Authentication.
- Multi-user accounts.
- Persistent cloud storage.
- PostgreSQL.
- pgvector.
- Full RAG pipeline.
- Voice recognition.
- Text-to-speech.
- WebSockets.
- Real-time streaming responses.
- Analytics dashboard.
- Mobile application.
- Production-grade deployment infrastructure.
- Large question banks.
- Long 30–60 question examinations.

These may become future features.

---

# 6. MVP User Flow

```text
Landing Page
     |
     v
Upload PDF
     |
     v
Enter Subject
     |
     v
Select Difficulty
     |
     v
Start Viva
     |
     v
AI Question
     |
     v
Student Answer
     |
     v
AI Evaluation
     |
     +------> Follow-up Question
     |              |
     |              v
     +--------> Next Question
                    |
                    v
              Repeat x5
                    |
                    v
              Final Report
```

---

# 7. Functional Requirements

## FR-01 — Study Material Upload

The user must be able to upload a PDF containing their study material.

### Input

- PDF file.

### MVP constraints

- One PDF per session.
- Reasonable document size limit.
- No permanent storage required.

### Output

Extracted text available to the viva engine.

---

## FR-02 — Session Configuration

Before starting the viva, the user selects:

- Subject.
- Difficulty.

### Difficulty levels

- Easy
- Medium
- Hard

Default:

**Medium**

---

## FR-03 — Question Generation

The AI examiner must generate one question at a time.

Questions should:

- Be grounded in the uploaded material.
- Match the selected subject.
- Match the selected difficulty.
- Test conceptual understanding.
- Avoid unnecessary repetition.
- Avoid giving the answer.

### Example

```text
What is the difference between a process
and a thread?
```

---

## FR-04 — Answer Submission

The student must be able to enter their answer using a text input/textarea.

The UI should clearly show:

- Current question.
- Question number.
- Total questions.
- Answer field.
- Submit button.

MVP viva length:

**5 questions.**

---

## FR-05 — Answer Evaluation

After an answer is submitted, the AI must evaluate it.

The evaluation should include:

- Score from 0–10.
- Correctness.
- Missing concepts.
- Short feedback.
- Whether a follow-up question is appropriate.

### Example

```text
Score: 7/10

Good explanation of the basic distinction.

Missing concepts:
- Shared resources
- Thread independence

Follow-up:
Why are threads considered lightweight
compared with processes?
```

---

## FR-06 — Adaptive Follow-Up Questions

The examiner should use the student's answer and evaluation to decide what to ask next.

Example:

```text
Question:
What is a process?

Answer:
A process is basically a program.

Evaluation:
Partial answer.
Missing "program in execution".

Follow-up:
What happens to a program when it
actually begins execution?
```

This is the core differentiating feature of VivaBuddy.

---

## FR-07 — Viva Completion

After five questions, the session ends.

The user should be shown a clear completion state.

---

## FR-08 — Final Report

The final report should include:

### Overall score

```text
78 / 100
```

### Category scores

- Conceptual Understanding
- Technical Accuracy
- Depth

### Strengths

Example:

```text
- Process management
- CPU scheduling
```

### Weak areas

Example:

```text
- Deadlocks
- Synchronization
```

### Recommendations

Example:

```text
Review semaphores and deadlock prevention
before the viva.
```

---

# 8. AI Architecture

The MVP uses Ollama with an open-weight model.

Current local model:

```text
qwen2.5-coder:7b
```

Architecture:

```text
             PDF
              |
              v
      PDF Text Extraction
              |
              v
       Study Material
              |
              v
      +----------------+
      |     Ollama     |
      | Qwen2.5-Coder  |
      |      7B        |
      +-------+--------+
              |
       +------+------+
       |             |
       v             v
 Question        Evaluation
 Generator          Engine
       |             |
       +------+------+
              |
              v
        Viva Session
              |
              v
         Final Report
```

### Important MVP decision

The first version uses **document-grounded prompting**, not a full RAG pipeline.

The PDF is parsed into text and relevant material is provided to the model.

A proper retrieval pipeline can be introduced in v2.

---

# 9. Technology Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS

## Backend

- Next.js Route Handlers

## AI

- Ollama
- Qwen2.5-Coder 7B

## Document Processing

- pdf-parse

## Validation

- Zod

## Storage

- None for MVP.

---

# 10. API Specification

## POST `/api/viva/question`

Generates the next viva question.

### Request

```json
{
  "material": "...",
  "subject": "Operating Systems",
  "difficulty": "medium",
  "previousQuestions": []
}
```

### Response

```json
{
  "question": "What is the difference between a process and a thread?",
  "topic": "Processes and Threads",
  "difficulty": "medium"
}
```

---

## POST `/api/viva/evaluate`

Evaluates a student's answer.

### Request

```json
{
  "question": "...",
  "answer": "...",
  "material": "..."
}
```

### Response

```json
{
  "score": 7,
  "feedback": "Good explanation of the basic distinction.",
  "missingConcepts": [
    "shared resources",
    "thread independence"
  ],
  "followUp": "Why are threads considered lightweight compared with processes?"
}
```

---

## POST `/api/viva/report`

Generates the final viva report.

### Request

```json
{
  "questions": [],
  "answers": [],
  "evaluations": []
}
```

### Response

```json
{
  "overallScore": 78,
  "strengths": [],
  "weakAreas": [],
  "recommendations": []
}
```

---

# 11. Suggested Project Structure

```text
vivabuddy/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── viva/
│   │   │   └── page.tsx
│   │   ├── results/
│   │   │   └── page.tsx
│   │   └── api/
│   │       └── viva/
│   │           ├── question/
│   │           │   └── route.ts
│   │           ├── evaluate/
│   │           │   └── route.ts
│   │           └── report/
│   │               └── route.ts
│   │
│   ├── components/
│   │   ├── upload/
│   │   ├── viva/
│   │   └── results/
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── ollama.ts
│   │   │   ├── prompts.ts
│   │   │   └── evaluator.ts
│   │   └── documents/
│   │       ├── parser.ts
│   │       └── chunker.ts
│   │
│   └── types/
│       └── viva.ts
│
├── public/
├── README.md
├── package.json
└── .env
```

---

# 12. UI Requirements

## Landing Page

Should communicate immediately:

```text
VivaBuddy

Practice your viva with a local AI examiner.

Upload your study material.
Answer questions.
Get adaptive follow-ups.
Find your weak areas.

[ Start Viva ]
```

---

## Viva Screen

```text
VIVABUDDY

Operating Systems
Question 2 / 5

--------------------------------

What is the difference between
a process and a thread?

--------------------------------

[ Type your answer here... ]

                         [Submit]
```

Include:

- Progress indicator.
- Loading state while AI responds.
- Clear question/answer hierarchy.
- Disabled submit state while processing.

---

## Results Screen

```text
VIVA COMPLETE

78%
Overall Score

Conceptual Understanding    82%
Technical Accuracy          76%
Depth                       71%

Strengths
✓ Process management
✓ CPU scheduling

Needs Revision
⚠ Deadlocks
⚠ Synchronization

Recommended:
Review semaphores and deadlock
prevention before your viva.

[ Practice Again ]
```

---

# 13. AI Prompt Requirements

The examiner prompt must enforce:

1. One question at a time.
2. Grounding in provided material.
3. Appropriate difficulty.
4. Conceptual questioning.
5. No answer leakage.
6. No unnecessary repetition.
7. Follow-up questions based on the student's response.
8. Structured JSON output where possible.

The evaluator prompt must enforce:

1. Objective scoring.
2. Identification of missing concepts.
3. Concise feedback.
4. Follow-up recommendation.
5. No fabricated claims about material.

The report prompt must summarize the entire session rather than evaluating answers independently.

---

# 14. Privacy / Open AI Rationale

VivaBuddy's AI runs locally using Ollama and an open-weight model.

This provides:

- Local inference.
- No mandatory cloud AI API.
- No API cost for model inference.
- Study material can remain on the user's machine.
- Student answers can remain local.
- Model choice can be changed by the user.
- The system is reproducible using open tooling.

This is an important part of the Hacktoberfest project story.

---

# 15. Six-Hour Development Plan

## Hour 1 — Foundation

- Create Next.js project.
- Configure Tailwind.
- Verify Ollama.
- Verify Qwen2.5-Coder 7B.
- Connect Next.js to Ollama.

### Deliverable

Next.js can receive an AI-generated question.

---

## Hour 2 — Document Ingestion

- Build PDF upload.
- Extract PDF text.
- Validate file.
- Store extracted text in client/session state.

### Deliverable

PDF → usable text.

---

## Hour 3 — Viva Engine

- Build question generation.
- Build answer UI.
- Build evaluation endpoint.
- Connect evaluation to UI.

### Deliverable

One complete question/answer/evaluation cycle.

---

## Hour 4 — Adaptive Viva

- Add follow-up logic.
- Maintain question history.
- Add 5-question limit.
- Add progress indicator.

### Deliverable

Complete 5-question viva.

---

## Hour 5 — Results + UI

- Build final report.
- Add scores.
- Add strengths.
- Add weak areas.
- Add recommendations.
- Polish loading/error states.

### Deliverable

Presentable product.

---

## Hour 6 — Submission

- Clean repository.
- Write README.
- Record demo.
- Test with real friend's material.
- Collect feedback.
- Write DEV submission.
- Add screenshots/GIF.
- Submit.

---

# 16. Definition of Done

VivaBuddy is considered complete when this flow works:

> Upload a study PDF → select subject/difficulty → start viva → receive an AI-generated question → submit an answer → receive an evaluation → receive an adaptive follow-up → complete five questions → receive a final performance report.

The project must also have:

- Working GitHub repository.
- Working demo or local demonstration.
- 60–90 second demo video.
- README.
- Hacktoberfest DEV write-up.
- Feedback from the real friend the project was built for.

---

# 17. Future Roadmap

These are explicitly **not MVP features**.

### v2

- Proper RAG with embeddings.
- pgvector.
- Persistent sessions.
- Question history.
- Better general-purpose open-weight model.
- Subject-specific examiner personalities.

### v3

- Voice-based viva.
- Speech-to-text.
- Text-to-speech.
- Real-time oral conversation.
- Difficulty adaptation based on performance.

### v4

- Multi-user accounts.
- Performance history.
- Topic-level analytics.
- Custom viva templates.
- Teacher/instructor mode.

---

# 18. Hacktoberfest Submission Narrative

The project should be presented around this story:

> A friend had an upcoming viva but didn't have anyone available to practice with. I built VivaBuddy so they could upload their study material and practice against a local AI examiner.

The submission should demonstrate:

1. The real problem.
2. The friend who had the problem.
3. The working product.
4. Adaptive questioning.
5. Why open-source AI was useful.
6. What the friend thought after trying it.
7. What could be improved next.

The focus should be on the **problem → build → real-world feedback** loop rather than simply presenting VivaBuddy as another AI chatbot.

---

# 19. Success Criteria

The MVP succeeds if:

- A new user understands the product within 10 seconds.
- A PDF can be uploaded successfully.
- At least 5 questions can be generated/evaluated in one session.
- Follow-up questions respond meaningfully to previous answers.
- The final report identifies useful weak areas.
- The entire AI workflow can run locally.
- A friend can use the application without developer assistance.
- The project can be demonstrated in under 90 seconds.
- The complete MVP can be built within approximately 6 hours.

---

## MVP Principle

**Do less, but make the core loop work extremely well.**

```text
          MATERIAL
              ↓
           QUESTION
              ↓
            ANSWER
              ↓
          EVALUATION
              ↓
        FOLLOW-UP
              ↓
          NEXT QUESTION
              ↓
            REPORT
```

This loop is VivaBuddy.
