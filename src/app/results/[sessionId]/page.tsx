"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import type { VivaReport, VivaSession } from "@/types/viva";
import { readSessionValue, subscribeToSessionChanges } from "@/lib/session-storage";

export default function ResultsPage(){
  const params=useParams<{sessionId:string}>();const id=params.sessionId;
  const sessionValue=useSyncExternalStore(subscribeToSessionChanges,()=>readSessionValue(`vivabuddy:${id}`),()=>"");
  const reportValue=useSyncExternalStore(subscribeToSessionChanges,()=>readSessionValue(`vivabuddy-report:${id}`),()=>"");
  const session=parseValue<VivaSession>(sessionValue);const report=parseValue<VivaReport>(reportValue);
  if(!session||!report)return <div className="app-shell"><header className="app-topbar"><Link className="brand" href="/">viva<span>buddy</span><i>✳</i></Link></header><main className="empty-state"><h1>Your report is waiting</h1><p>Finish a five-question practice session to see your feedback.</p><Link className="button button-dark" href="/upload">Start a new viva</Link></main></div>;
  return <div className="app-shell"><header className="app-topbar"><Link className="brand" href="/">viva<span>buddy</span><i>✳</i></Link><span className="back-link">Practice complete · {session.subject}</span></header><main className="app-main"><p className="eyebrow" style={{marginTop:5}}>THAT’S FIVE QUESTIONS</p><h1 className="page-title">You showed up. That counts.</h1><p className="page-subtitle">Here’s a snapshot of your {session.subject} practice. Use it as a guide for what to revisit.</p><div className="report-score"><div className="score-number">{report.overallScore}<span style={{fontSize:22}}>%</span></div><div><strong style={{fontSize:14}}>Overall practice score</strong><div className="score-label">A starting point for your next revision session.</div></div></div><section><h2 className="report-heading">How you did</h2>{[["Conceptual understanding",report.categories.conceptualUnderstanding],["Technical accuracy",report.categories.technicalAccuracy],["Depth",report.categories.depth]].map(([label,score])=><div className="metric-row" key={label as string}><span>{label}</span><strong>{score}%</strong></div>)}</section><div className="field-row" style={{marginTop:13}}><section><h2 className="report-heading">What’s clicking</h2><ul className="plain-list">{report.strengths.length?report.strengths.map(x=><li key={x}>{x}</li>):<li>Keep practicing to build confidence.</li>}</ul></section><section><h2 className="report-heading">Worth revisiting</h2><ul className="plain-list">{report.weakAreas.length?report.weakAreas.map(x=><li key={x}>{x}</li>):<li>Nothing major stood out. Keep it up!</li>}</ul></section></div><section><h2 className="report-heading">A good next step</h2><ul className="plain-list">{report.recommendations.map(x=><li key={x}>{x}</li>)}</ul></section><div style={{marginTop:28}}><Link className="button button-dark" href="/upload">Practice again <span>↗</span></Link><Link className="back-link" style={{marginLeft:18}} href="/">Back home</Link></div><p className="field-help" style={{marginTop:22}}>Your feedback is saved only in this browser tab and clears when the tab closes.</p></main></div>;
}

function parseValue<T>(value:string):T|null{if(!value)return null;try{return JSON.parse(value) as T}catch{return null}}
