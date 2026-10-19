import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUp, Check, ChevronRight, Loader2, MessageSquare, Phone, Plus, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PACKAGING_CATEGORIES } from "@/data/directory";
import { supabase } from "@/integrations/supabase/client";
import { readSaved, sourcingRequest, sourcingSubmission, validSourcingPhone, validatedQuestions, type SourcingProject } from "@/lib/sourcing";
import logo from "@/assets/snaplogo-orange.png";

const suggestions = [
  { title: "Custom paper bags", detail: "100 units · branded printing", query: "I need 100 custom printed kraft paper bags for my brand", category: "paper-bags" },
  { title: "E-commerce boxes", detail: "Corrugated · custom sizes", query: "I need custom corrugated shipping boxes for an e-commerce brand", category: "corrugated" },
  { title: "Stand-up pouches", detail: "Flexible · custom packaging", query: "I need stand-up pouches with custom printing for food packaging", category: "flexible" },
];
const PROJECTS_KEY = "snaplogo.sourcing.projects";

export default function SourcingAgent() {
  const [projects, setProjects] = useState<SourcingProject[]>(() => {
    const saved = readSaved<unknown>(PROJECTS_KEY, []);
    return Array.isArray(saved) ? saved.filter(p => p && typeof p.id === "string" && typeof p.title === "string" && Array.isArray(p.turns)) : [];
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pendingQuery, setPendingQuery] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const project = projects.find(p => p.id === activeId);
  const turns = project?.turns ?? [];
  const current = turns.at(-1);
  const hasQuestions = !current?.questionsSkipped && (current?.questions?.length ?? 0) > 0;

  useEffect(() => { try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); } catch { /* Keep session usable. */ } }, [projects]);
  useEffect(() => {
    document.title = "Snaplogo Sourcing Agent | Share your packaging requirement";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Share your packaging requirements, answer a few focused questions and request a phone follow-up from Snaplogo.");
  }, []);

  const startNew = () => { if (busy || submitting) return; setActiveId(null); setQuery(""); setPhone(""); setError(""); input.current?.focus(); };
  const search = async (text = query) => {
    const trimmed = text.trim();
    if (!trimmed || busy || submitting || project?.submitted) return;
    setBusy(true); setError(""); setPendingQuery(trimmed);
    const id = activeId ?? crypto.randomUUID();
    try {
      const { data, error: requestError } = await supabase.functions.invoke("directory-search", { body: { query: sourcingRequest(turns, trimmed), mode: "intake", conversation: turns.map(t => ({ request: t.query, questions: t.questions ?? [], skipped: t.questionsSkipped ?? false })) } });
      if (requestError || data?.error) throw new Error(data?.error || "I couldn’t continue this conversation. Please try again.");
      const turn = { query: trimmed, matches: [], questions: validatedQuestions(data?.questions, turns) };
      setProjects(prev => prev.some(p => p.id === id) ? prev.map(p => p.id === id ? { ...p, turns: [...p.turns, turn] } : p) : [{ id, title: trimmed.slice(0, 65), turns: [turn] }, ...prev]);
      setActiveId(id); setQuery("");
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); setPendingQuery(""); }
  };
  const submitPhone = async () => {
    const payload = sourcingSubmission(turns, phone);
    if (!payload || busy || submitting || project?.submitted) return;
    setSubmitting(true); setError("");
    try {
      const { error: insertError } = await supabase.from("requirement_submissions").insert(payload);
      if (insertError) throw new Error("Your request couldn’t be sent. Please try again.");
      setProjects(prev => prev.map(p => p.id === activeId ? { ...p, submitted: true } : p));
      setPhone("");
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setSubmitting(false); }
  };
  const composer = (compact = false) => (
    <form onSubmit={e => { e.preventDefault(); void search(); }} className={`sourcing-composer rounded-2xl border border-border bg-card p-3 ${compact ? "" : "mt-7"}`}>
      <label htmlFor="sourcing-query" className="sr-only">{compact ? "Your answer" : "Packaging requirement"}</label>
      <textarea ref={input} id="sourcing-query" value={query} onChange={e => setQuery(e.target.value)} maxLength={500} disabled={busy || submitting} rows={compact ? 2 : 3} placeholder={compact ? "Your answer, or any other details…" : "What packaging do you need?"} className="w-full resize-none bg-transparent px-2 pt-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void search(); } }} />
      <div className="flex items-center justify-between gap-2 pt-2"><span className="flex items-center gap-1.5 px-2 text-xs text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" />Snaplogo sourcing</span><Button type="submit" size="icon" disabled={busy || submitting || !query.trim()} aria-label="Send answer" className="h-10 w-10 rounded-full">{busy ? <Loader2 className="animate-spin" /> : <ArrowUp />}</Button></div>
    </form>
  );
  return (
    <div className="theme-sourcing min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <Link to="/sourcing" className="flex items-center gap-2 px-2 text-xl font-bold"><img src={logo} alt="" className="h-8 w-8" />snaplogo<span className="text-primary">.</span></Link>
        <Button onClick={startNew} disabled={busy || submitting} variant="outline" className="mt-8 w-full justify-start rounded-full"><Plus />New sourcing request</Button>
        <p className="mt-8 px-3 text-xs font-semibold text-muted-foreground">Recent requests</p>
        <div className="mt-2 flex-1 space-y-1 overflow-y-auto">{projects.map(p => <Button key={p.id} variant="ghost" disabled={busy || submitting} onClick={() => { setActiveId(p.id); setPhone(""); setQuery(""); setError(""); }} className={`h-auto w-full justify-start py-2.5 text-left text-xs ${p.id === activeId ? "bg-muted" : "text-muted-foreground"}`}><MessageSquare className="shrink-0" /><span className="truncate">{p.title}</span>{p.submitted && <Check className="ml-auto shrink-0 text-primary" />}</Button>)}</div>
      </aside>
      <div className="lg:ml-60">
        <header className="flex h-[72px] items-center justify-between gap-3 border-b border-border/60 px-5 md:px-10">
          <div className="flex items-center gap-2 text-sm"><Link to="/sourcing" className="font-bold lg:hidden">snaplogo<span className="text-primary">.</span></Link><span className="hidden text-muted-foreground sm:inline">Workspace</span><ChevronRight className="hidden h-3 w-3 text-muted-foreground sm:block" /><span className="font-medium">Sourcing agent</span></div>
          <Button onClick={startNew} disabled={busy || submitting} variant="outline" size="sm" className="rounded-full lg:hidden"><Plus />New request</Button>
        </header>
        <main className="mx-auto max-w-[900px] px-5 pb-12 md:px-10">
          {!current && !busy && <div className="mx-auto max-w-[780px] pb-4 pt-14 md:pt-20">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" />YOUR SOURCING PARTNER</div>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Snaplogo Sourcing Agent<span className="mt-3 block text-2xl font-normal text-muted-foreground md:text-3xl">What are you looking to source?</span></h1>
            {composer()}
            <div className="mt-10 grid gap-3 sm:grid-cols-3">{suggestions.map(s => <Button key={s.title} variant="outline" onClick={() => void search(s.query)} className="group h-auto flex-col items-start overflow-hidden rounded-lg bg-card p-0 text-left whitespace-normal"><img src={PACKAGING_CATEGORIES.find(c => c.key === s.category)?.image} alt={s.title} className="aspect-[1.8/1] w-full object-cover" /><span className="flex w-full items-center justify-between px-3 pt-3 text-sm font-semibold">{s.title}<ArrowRight className="shrink-0 text-muted-foreground" /></span><span className="px-3 pb-3 text-xs font-normal text-muted-foreground">{s.detail}</span></Button>)}</div>
          </div>}
          {(current || busy) && <div className="mx-auto max-w-[780px] py-8">
            <ol className="mb-8 flex items-center gap-2 text-xs font-medium" aria-label="Progress">{["Describe need", "Add details", "Request a call"].map((label, i) => { const step = project?.submitted ? 3 : hasQuestions || busy ? 1 : 2; const done = i < step; const active = i === step; return <li key={label} className="flex flex-1 items-center gap-2"><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] ${done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{done ? <Check className="h-3.5 w-3.5" /> : i + 1}</span><span className={`hidden sm:inline ${done || active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>{i < 2 && <span className={`h-px flex-1 ${done ? "bg-primary" : "bg-border"}`} />}</li>; })}</ol>
            <div className="space-y-6">{turns.map((turn, index) => <div key={index} className="space-y-4"><div className="ml-auto max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground">{turn.query}</div>{(turn.questions?.length ?? 0) > 0 && <div className="flex max-w-[90%] gap-3"><img src={logo} alt="" className="mt-1 h-8 w-8 shrink-0 rounded-full border border-border bg-card p-1" /><div className="sourcing-composer rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-sm leading-relaxed"><p className="mb-2 text-xs font-semibold text-muted-foreground">A few quick details would help</p><ul className="space-y-2">{turn.questions?.map((q, qi) => <li key={q.topic} className="flex gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">{qi + 1}</span>{q.question}</li>)}</ul>{turn.questionsSkipped && <p className="mt-2 text-xs text-muted-foreground">Skipped</p>}</div></div>}</div>)}{busy && <div className="ml-auto max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground">{pendingQuery}</div>}</div>
            {busy ? <div className="flex items-center gap-3 py-10 text-sm text-muted-foreground" role="status"><Loader2 className="h-5 w-5 animate-spin text-primary" />Reviewing your packaging details…</div> : project?.submitted ? <section role="status" className="sourcing-composer mt-8 rounded-2xl border border-border bg-card p-6 text-center"><span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent"><Check className="h-6 w-6 text-accent-foreground" /></span><h2 className="text-xl font-semibold">Thank you — your request is received.</h2><p className="mt-2 text-sm text-muted-foreground">Someone from our team will reach out to you with the relevant details.</p><Button onClick={startNew} variant="outline" className="mt-5 rounded-full"><Plus />New sourcing request</Button></section> : <>
              <div className="mt-6">{composer(true)}</div>
              {hasQuestions && <div className="mt-2 flex justify-end"><Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setProjects(prev => prev.map(p => p.id === activeId ? { ...p, turns: p.turns.map((t, i) => i === p.turns.length - 1 ? { ...t, questionsSkipped: true } : t) } : p))}>Skip for now<ArrowRight /></Button></div>}
              {!hasQuestions && <form onSubmit={e => { e.preventDefault(); void submitPhone(); }} className="sourcing-composer mt-8 rounded-2xl border border-border bg-card p-6" aria-label="Request a phone follow-up"><h2 className="flex items-center gap-3 text-lg font-semibold"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent"><Phone className="h-4 w-4 text-accent-foreground" /></span>What’s your phone number?</h2><p className="mt-2 text-sm text-muted-foreground">Someone from our team will reach out to you with the relevant details.</p><label htmlFor="sourcing-phone" className="mt-5 block text-xs font-medium">Phone number</label><div className="mt-2 flex flex-col gap-3 sm:flex-row"><Input id="sourcing-phone" type="tel" autoComplete="tel" placeholder="+91" value={phone} maxLength={25} onChange={e => setPhone(e.target.value)} disabled={submitting} required className="h-12 sm:max-w-xs" /><Button type="submit" disabled={submitting || !validSourcingPhone(phone) || !!query.trim()} className="h-12 rounded-full">{submitting ? <Loader2 className="animate-spin" /> : <Phone />}Request a call</Button></div><p className="mt-3 text-xs text-muted-foreground">By requesting a call, you agree to be contacted about this sourcing request.</p>{query.trim() && <p className="mt-2 text-xs text-muted-foreground">Send your additional details before requesting a call.</p>}</form>}
            </>}
          </div>}
          {error && <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-card p-4 text-sm text-destructive"><span className="flex-1">{error}</span><Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Dismiss error" onClick={() => setError("")}><X /></Button></div>}
        </main>
      </div>
    </div>
  );
}
