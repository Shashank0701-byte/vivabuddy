"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import type { Difficulty, VivaSession } from "@/types/viva";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState<"checking" | "ready" | "missing">("checking");
  useEffect(() => { fetch("/api/health").then(async r => { const data = await r.json(); setHealth(r.ok && data.installed ? "ready" : "missing"); }).catch(() => setHealth("missing")); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!file) { setError("Choose a PDF with selectable text to get started."); return; }
    if (subject.trim().length < 2) { setError("Add the subject you are preparing for."); return; }
    setLoading(true);
    try {
      const form = new FormData(); form.set("file", file);
      const documentResponse = await fetch("/api/documents", { method: "POST", body: form });
      const documentData = await documentResponse.json();
      if (!documentResponse.ok) throw new Error(documentData.error || "Could not read the PDF.");
      const startResponse = await fetch("/api/viva/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ material: documentData.text, subject: subject.trim(), difficulty }) });
      const startData = await startResponse.json();
      if (!startResponse.ok) throw new Error(startData.error || "Could not start a viva.");
      const id = crypto.randomUUID();
      const session: VivaSession = { id, subject: subject.trim(), difficulty, material: documentData.text, fileName: documentData.fileName, question: startData, answers: [], createdAt: new Date().toISOString() };
      sessionStorage.setItem(`vivabuddy:${id}`, JSON.stringify(session));
      router.push(`/viva/${id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return <div className="app-shell"><header className="app-topbar"><Link className="brand" href="/">viva<span>buddy</span><i>✳</i></Link><Link className="back-link" href="/">← Back home</Link></header><main className="app-main"><Link className="back-link" href="/">← Home</Link><p className="eyebrow" style={{marginTop:24}}>LET’S GET YOU READY</p><h1 className="page-title">Set up your practice</h1><p className="page-subtitle">Bring the notes you’ll be asked about. We’ll take it one question at a time.</p>
    <div className={health === "ready" ? "hint-box" : "error-box"}>{health === "checking" ? "Checking the configured Ollama service…" : health === "ready" ? "The configured Ollama service and model are ready." : <>The configured Ollama service or model is unavailable. For local development, start Ollama and run <code>ollama pull qwen2.5-coder:7b</code>, then refresh.</>}</div>
    <form onSubmit={submit} className="panel"><label className="field-label" htmlFor="study-file">Your study material</label><div className="upload-box"><div className="upload-icon">↑</div><strong style={{fontSize:13}}>Choose your study PDF</strong><p className="field-help">Text based PDF · Up to 12 MB</p><input id="study-file" type="file" accept="application/pdf,.pdf" onChange={e=>setFile(e.target.files?.[0]||null)}/>{file&&<div className="file-meta">✓ {file.name} · {(file.size/1024/1024).toFixed(1)} MB</div>}</div>
      <div className="field-row"><div><label className="field-label" htmlFor="subject">Subject</label><input className="text-input" id="subject" placeholder="e.g. Operating Systems" value={subject} onChange={e=>setSubject(e.target.value)} maxLength={100}/></div><div><label className="field-label" htmlFor="difficulty">Difficulty</label><select className="select-input" id="difficulty" value={difficulty} onChange={e=>setDifficulty(e.target.value as Difficulty)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div></div>
      {error&&<div className="error-box" role="alert">{error}</div>}<button className="button button-dark" type="submit" disabled={loading||health!=="ready"} style={{marginTop:23,opacity:(loading||health!=="ready")?0.65:1}}>{loading?"Preparing your first question…":"Start my viva"}<span>↗</span></button><p className="field-help" style={{marginTop:12}}>Your PDF is sent to this VivaBuddy server for text extraction; the extracted text is sent to its configured Ollama service. Session data stays in this browser tab and is not saved to a database.</p></form>
    </main></div>;
}
