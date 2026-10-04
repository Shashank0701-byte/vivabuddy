"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import type { AnswerRecord, Evaluation, VivaQuestion, VivaReport, VivaSession } from "@/types/viva";
import { readSessionValue, saveSessionValue, subscribeToSessionChanges } from "@/lib/session-storage";

export default function VivaPage() {
  const router = useRouter(); const params = useParams<{sessionId:string}>(); const id = params.sessionId;
  const sessionValue = useSyncExternalStore(subscribeToSessionChanges, () => readSessionValue(`vivabuddy:${id}`), () => "");
  const session = parseSession(sessionValue);
  const [answer,setAnswer]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [lastEvaluation,setLastEvaluation]=useState<Evaluation|null>(null);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(!session||!answer.trim())return;setBusy(true);setError("");
    try{
      const response=await fetch("/api/viva/answer",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({material:session.material,subject:session.subject,difficulty:session.difficulty,question:session.question.question,answer:answer.trim(),previousQuestions:session.answers.map(x=>x.question)})});const data=await response.json();if(!response.ok)throw new Error(data.error||"Could not evaluate your answer.");
      const evaluation=data as Evaluation;const record:AnswerRecord={question:session.question.question,topic:session.question.topic,answer:answer.trim(),evaluation};const updated={...session,answers:[...session.answers,record]};
      if(updated.answers.length>=5){const reportResponse=await fetch("/api/viva/evaluate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({subject:updated.subject,answers:updated.answers})});const reportData=await reportResponse.json();if(!reportResponse.ok)throw new Error(reportData.error||"Could not make your report. Your answer is still here, so you can retry.");saveSessionValue(`vivabuddy:${id}`,JSON.stringify(updated));saveSessionValue(`vivabuddy-report:${id}`,JSON.stringify(reportData as VivaReport));router.push(`/results/${id}`);return;}
      let nextQuestion:VivaQuestion;
      if(evaluation.followUp?.trim())nextQuestion={question:evaluation.followUp,topic:record.topic};
      else{const nextResponse=await fetch("/api/viva/start",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({material:updated.material,subject:updated.subject,difficulty:updated.difficulty,previousQuestions:updated.answers.map(x=>x.question)})});const nextData=await nextResponse.json();if(!nextResponse.ok)throw new Error(nextData.error||"Your answer is saved, but the next question could not be generated.");nextQuestion=nextData as VivaQuestion;}
      const ready={...updated,question:nextQuestion};saveSessionValue(`vivabuddy:${id}`,JSON.stringify(ready));setLastEvaluation(evaluation);setAnswer("");
    }catch(reason){setError(reason instanceof Error?reason.message:"Something went wrong. Please try again.");}
    finally{setBusy(false);}
  }
  if(!session)return <div className="app-shell"><header className="app-topbar"><Link className="brand" href="/">viva<span>buddy</span><i>✳</i></Link></header><main className="empty-state"><h1>Practice session not found</h1><p>Your session may have been cleared when this tab was closed.</p><Link className="button button-dark" href="/upload">Start a new viva</Link></main></div>;
  const number=session.answers.length+1;
  return <div className="app-shell"><header className="app-topbar"><Link className="brand" href="/">viva<span>buddy</span><i>✳</i></Link><span className="back-link">{session.subject} · {session.difficulty}</span></header><main className="app-main"><Link className="back-link" href="/upload">← End session</Link><p className="eyebrow" style={{marginTop:23}}>YOUR PRACTICE ROOM</p><h1 className="page-title">Take your time.</h1><p className="page-subtitle">A good viva is a conversation. Answer in your own words; it’s okay to pause and think.</p><div className="step-progress" aria-label={`Question ${number} of 5`}>{[1,2,3,4,5].map(i=><span key={i} className={i<=number?"active":""}/>)}</div><p className="question-label">Question {number} <span style={{color:"#a5aca5"}}>/ 5</span></p><section className="panel"><p className="question-text">{session.question.question}</p><p className="field-help">Topic · {session.question.topic}</p></section>
    {lastEvaluation&&<div className="feedback-card"><strong>Your last answer · {lastEvaluation.score}/10</strong>{lastEvaluation.feedback}{lastEvaluation.missingConcepts.length>0&&<ul>{lastEvaluation.missingConcepts.map(item=><li key={item}>{item}</li>)}</ul>}</div>}
    <form onSubmit={submit}><label className="field-label" htmlFor="answer">Your answer</label><textarea className="text-area" id="answer" placeholder="Tell me how you understand it…" value={answer} onChange={e=>setAnswer(e.target.value)} maxLength={6000} required/><div style={{display:"flex",alignItems:"center",marginTop:14}}><button className="button button-dark" type="submit" disabled={busy||!answer.trim()} style={{opacity:(busy||!answer.trim())?0.65:1}}>{busy?"Thinking it through…":"Submit answer"}<span>↗</span></button>{busy&&<span className="loading-note" aria-live="polite">Your local examiner is listening.</span>}</div></form>{error&&<div className="error-box" role="alert">{error}</div>}<div className="hint-box">A practice space, not a grade. Your answers stay in this browser tab.</div>
  </main></div>;
}

function parseSession(value: string): VivaSession | null {
  if (!value) return null;
  try { return JSON.parse(value) as VivaSession; } catch { return null; }
}
