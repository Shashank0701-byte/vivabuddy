import Link from "next/link";

const steps = [
  ["01", "Bring your notes", "Add a study PDF and VivaBuddy will use it as the source for your session."],
  ["02", "Think out loud", "Answer five questions, with follow-ups shaped by what you say."],
  ["03", "Know what to revisit", "Get concise feedback and a report highlighting strengths and gaps."],
];

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="topbar"><Link className="brand" href="/">viva<span>buddy</span><i>✳</i></Link><span className="local-pill"><b /> Runs on its Ollama host</span></nav>
      <section className="hero">
        <div className="hero-copy"><p className="eyebrow"><span>✳</span> YOUR STUDY PARTNER, ON CALL</p><h1>Practice the viva.<br/><em>Find your footing.</em></h1><p className="hero-lede">A self-hosted AI examiner that asks about your own study material, follows your thinking, and helps you spot what to revise next.</p><Link className="button button-dark" href="/upload">Start a practice session <span>↗</span></Link><p className="privacy-note">No external AI API · Session data is not saved to a database</p></div>
        <div className="hero-art" aria-label="Illustration of a viva practice session"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-spark">✳</div><div className="art-card"><div className="art-card-top"><span className="art-dot"/> YOUR PRACTICE ROOM <span>•••</span></div><div className="art-question-mark">“</div><p>Can you explain how a<br/>process differs from a thread?</p><div className="art-bottom"><div className="avatar">V</div><span>Your examiner is listening</span><span className="wave"><i/><i/><i/><i/><i/></span></div></div><div className="art-note">one question at a time <span>↗</span></div><div className="art-bubble">You’ve got this.</div></div>
      </section>
      <section className="how-section"><div className="section-heading"><p className="eyebrow">A LITTLE PRACTICE GOES A LONG WAY</p><h2>From notes to <em>“I’ve got this.”</em></h2></div><div className="steps-grid">{steps.map(([number,title,body])=><article className="step-card" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
      <footer className="site-footer"><span>Made for the moments before “Any questions?”</span><span>Local AI · Open source spirit <i>✳</i></span></footer>
    </main>
  );
}
