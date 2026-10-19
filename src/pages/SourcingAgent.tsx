import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUp, Bookmark, Check, ChevronRight, Compass, ExternalLink, Loader2, MessageSquare, Plus, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SourcingSupplier } from "@/components/directory/SourcingSupplier";
import { fetchPublishedManufacturers, CUSTOMIZATION, placeOf, PACKAGING_CATEGORIES, type DirectoryManufacturer } from "@/data/directory";
import { supabase } from "@/integrations/supabase/client";
import { readSaved, sourcingRequest, validatedMatches, validatedQuestions, type SourcingProject } from "@/lib/sourcing";
import logo from "@/assets/snaplogo-orange.png";

const suggestions = [
  { title: "Custom paper bags", detail: "100 units · branded printing", query: "I need 100 custom printed kraft paper bags for my brand" , category: "paper-bags" },
  { title: "E-commerce boxes", detail: "Corrugated · custom sizes", query: "Find manufacturers for custom corrugated shipping boxes for an e-commerce brand", category: "corrugated" },
  { title: "Stand-up pouches", detail: "Flexible · custom packaging", query: "I need stand-up pouches with custom printing for food packaging", category: "flexible" },
];
const PROJECTS_KEY = "snaplogo.sourcing.projects";
const SAVED_KEY = "snaplogo.sourcing.saved";

export default function SourcingAgent() {
  const [manufacturers, setManufacturers] = useState<DirectoryManufacturer[]>([]);
  const [projects, setProjects] = useState<SourcingProject[]>(() => {
    const saved = readSaved<unknown>(PROJECTS_KEY, []);
    return Array.isArray(saved) ? saved.filter(p => p && typeof p.id === "string" && typeof p.title === "string" && Array.isArray(p.turns)) : [];
  });
  const [saved, setSaved] = useState<string[]>(() => {
    const value = readSaved<unknown>(SAVED_KEY, []);
    return Array.isArray(value) ? value.filter(v => typeof v === "string") : [];
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tab, setTab] = useState<"source" | "saved" | "compare">("source");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pendingQuery, setPendingQuery] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const project = projects.find(p => p.id === activeId);
  const turns = project?.turns ?? [];
  const current = turns.at(-1);
  const shortlist = manufacturers.filter(m => saved.includes(m.id));

  useEffect(() => { fetchPublishedManufacturers().then(setManufacturers).catch(() => setError("Manufacturers could not be loaded. Please refresh and try again.")); }, []);
  useEffect(() => { try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); } catch { /* Keep the current session usable when storage is full. */ } }, [projects]);
  useEffect(() => { try { localStorage.setItem(SAVED_KEY, JSON.stringify(saved)); } catch { /* Keep the current session usable when storage is full. */ } }, [saved]);
  useEffect(() => {
    document.title = "Snaplogo Sourcing Agent | Find your packaging partner";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Find packaging manufacturers with AI, refine your requirements, compare suppliers and contact your shortlist directly.");
  }, []);

  const startNew = () => { if (busy) return; setActiveId(null); setTab("source"); setQuery(""); setError(""); input.current?.focus(); };
  const toggleSave = (id: string) => setSaved(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  const search = async (text = query) => {
    const trimmed = text.trim();
    if (!trimmed || busy || !manufacturers.length) return;
    setBusy(true); setError(""); setPendingQuery(trimmed); setTab("source");
    const id = activeId ?? crypto.randomUUID();
    try {
      const { data, error: requestError } = await supabase.functions.invoke("directory-search", { body: { query: sourcingRequest(turns, trimmed), manufacturers, mode: "sourcing", conversation: turns.map(t => ({ request: t.query, questions: t.questions ?? [], skipped: t.questionsSkipped ?? false })) } });
      if (requestError || data?.error) throw new Error(data?.error || "The sourcing agent couldn’t complete this search. Please try again.");
      const turn = { query: trimmed, matches: validatedMatches(data?.matches, manufacturers), questions: validatedQuestions(data?.questions, turns) };
      setProjects(prev => {
        const existing = prev.find(p => p.id === id);
        return existing ? prev.map(p => p.id === id ? { ...p, turns: [...p.turns, turn] } : p) : [{ id, title: trimmed.slice(0, 65), turns: [turn] }, ...prev];
      });
      setActiveId(id); setQuery("");
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); setPendingQuery(""); }
  };

  const composer = (compact = false) => (
    <form onSubmit={e => { e.preventDefault(); void search(); }} className={`sourcing-composer rounded-2xl border border-border bg-card p-3 ${compact ? "" : "mt-7"}`}>
      <label htmlFor="sourcing-query" className="sr-only">Packaging requirement</label>
      <textarea ref={input} id="sourcing-query" value={query} onChange={e => setQuery(e.target.value)} maxLength={500} disabled={busy} rows={compact ? 2 : 3} placeholder={compact ? "Refine your request — quantity, size, location or printing…" : "Tell me what you’re sourcing. Include quantity, size, printing, or your delivery city…"} className="w-full resize-none bg-transparent px-2 pt-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void search(); } }} />
      <div className="flex items-center justify-between gap-2 pt-2">
        <span className="flex items-center gap-1.5 px-2 text-xs text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" />Packaging sourcing agent</span>
        <Button type="submit" size="icon" disabled={busy || !query.trim() || !manufacturers.length} aria-label="Find manufacturers" className="h-10 w-10 rounded-full">{busy ? <Loader2 className="animate-spin" /> : <ArrowUp />}</Button>
      </div>
    </form>
  );

  return (
    <div className="theme-sourcing min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <Link to="/sourcing" className="flex items-center gap-2 px-2 text-xl font-bold"><img src={logo} alt="" className="h-8 w-8" />snaplogo<span className="text-primary">.</span></Link>
        <Button onClick={startNew} disabled={busy} variant="outline" className="mt-8 w-full justify-start rounded-full"><Plus />New sourcing request</Button>
        <nav aria-label="Sourcing workspace" className="mt-6 space-y-1">
          {[{ id: "source" as const, label: "Sourcing agent", icon: Compass }, { id: "saved" as const, label: "Saved suppliers", icon: Bookmark }, { id: "compare" as const, label: "Compare suppliers", icon: SlidersHorizontal }].map(item => <Button key={item.id} variant="ghost" onClick={() => setTab(item.id)} className={`w-full justify-start ${tab === item.id ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}><item.icon />{item.label}{item.id === "saved" && saved.length > 0 && <span className="ml-auto text-xs">{saved.length}</span>}</Button>)}
        </nav>
        <p className="mt-8 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Recent requests</p>
        <div className="mt-2 flex-1 space-y-1 overflow-y-auto">{projects.map(p => <Button key={p.id} variant="ghost" disabled={busy} onClick={() => { setActiveId(p.id); setTab("source"); setError(""); }} className={`h-auto w-full justify-start py-2.5 text-left text-xs ${p.id === activeId ? "bg-muted" : "text-muted-foreground"}`}><MessageSquare className="shrink-0" /><span className="truncate">{p.title}</span></Button>)}</div>
        <Button asChild variant="ghost" className="justify-start text-xs text-muted-foreground"><Link to="/manufacturers"><ExternalLink />Manufacturer directory</Link></Button>
        <div className="mt-4 flex items-center gap-3 border-t border-border px-2 pt-4"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">S</span><div><p className="text-xs font-medium">Your sourcing workspace</p><p className="text-[10px] text-muted-foreground">Saved on this device</p></div></div>
      </aside>

      <div className="lg:ml-60">
        <header className="flex h-[72px] items-center justify-between gap-3 border-b border-border/60 px-5 md:px-10">
          <div className="flex items-center gap-2 text-sm"><Link to="/sourcing" className="font-bold lg:hidden">snaplogo<span className="text-primary">.</span></Link><span className="hidden text-muted-foreground sm:inline">Workspace</span><ChevronRight className="hidden h-3 w-3 text-muted-foreground sm:block" /><span className="hidden font-medium sm:inline">{tab === "source" ? "Sourcing agent" : tab === "saved" ? "Saved suppliers" : "Compare suppliers"}</span></div>
          <div className="flex items-center gap-2"><span className="hidden rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-foreground md:inline-flex">India · Packaging</span><Button asChild variant="outline" size="sm" className="rounded-full bg-card"><Link to="/app/store">For manufacturers<ArrowUpRightIcon /></Link></Button></div>
        </header>
        <div className="flex gap-2 overflow-x-auto border-b border-border bg-card p-3 lg:hidden"><Button onClick={startNew} disabled={busy} variant="ghost" size="sm" aria-label="New sourcing request"><Plus /></Button><Button variant={tab === "source" ? "secondary" : "ghost"} size="sm" onClick={() => setTab("source")}>Source</Button><Button variant={tab === "saved" ? "secondary" : "ghost"} size="sm" onClick={() => setTab("saved")}>Saved ({saved.length})</Button><Button variant={tab === "compare" ? "secondary" : "ghost"} size="sm" onClick={() => setTab("compare")}>Compare</Button></div>

        <main className="mx-auto max-w-[1100px] px-5 pb-12 md:px-10">
          {tab === "source" && !current && !busy && (
            <div className="mx-auto max-w-[780px] pb-4 pt-14 md:pt-20">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" />YOUR AI SOURCING PARTNER</div>
              <h1 className="text-4xl font-semibold leading-[1.2] md:text-5xl">Snaplogo Sourcing Agent<span className="mt-3 block text-2xl font-normal text-muted-foreground md:text-3xl">What are you looking to source?</span></h1>
              <p className="mt-4 text-sm text-muted-foreground">The right packaging starts with the right manufacturing partner.</p>
              {composer()}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span>Start with:</span>{["Low MOQ packaging", "Custom printing", "Packaging samples"].map(text => <Button key={text} variant="outline" size="sm" className="h-7 rounded-full bg-card px-3 text-[11px]" onClick={() => { setQuery(`Find manufacturers for ${text.toLowerCase()}`); input.current?.focus(); }}>{text}<Plus className="!h-3 !w-3" /></Button>)}</div>
              <div className="mt-12 flex items-center justify-between"><h2 className="text-sm font-semibold">Explore a sourcing request</h2><span className="text-[11px] text-muted-foreground">Made for growing brands</span></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">{suggestions.map(s => <Button key={s.title} variant="outline" onClick={() => void search(s.query)} className="group h-auto flex-col items-start overflow-hidden rounded-lg bg-card p-0 text-left whitespace-normal"><img src={PACKAGING_CATEGORIES.find(c => c.key === s.category)?.image} alt={s.title} className="aspect-[1.8/1] w-full object-cover" /><span className="flex w-full items-center justify-between px-3 pt-3 text-sm font-semibold">{s.title}<ArrowRight className="text-muted-foreground transition-transform group-hover:translate-x-1" /></span><span className="px-3 pb-3 text-[11px] font-normal text-muted-foreground">{s.detail}</span></Button>)}</div>
            </div>
          )}

          {tab === "source" && (current || busy) && <div className="py-8">
            <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"><Sparkles className="h-4 w-4 text-primary" />Sourcing conversation</div>
            <div className="space-y-3">{turns.map((turn, index) => <div key={index}><div className="ml-auto max-w-[85%] rounded-lg bg-muted px-4 py-3 text-sm">{turn.query}</div>{index < turns.length - 1 && !turn.questionsSkipped && (turn.questions?.length ?? 0) > 0 && <div className="mt-3 space-y-1 px-2 text-sm text-muted-foreground">{turn.questions?.map(q => <p key={q.topic}>{q.question}</p>)}</div>}</div>)}{busy && <div className="ml-auto max-w-[85%] rounded-lg bg-muted px-4 py-3 text-sm">{pendingQuery}</div>}</div>
            {busy ? <div className="flex items-center gap-3 py-12 text-sm text-muted-foreground" role="status"><Loader2 className="h-5 w-5 animate-spin text-primary" />Matching your requirements with listed manufacturers…</div> : current && <>
              {!current.questionsSkipped && (current.questions?.length ?? 0) > 0 && <section aria-label="Sourcing follow-up questions" className="mt-6 border-l-2 border-primary pl-4"><p className="mb-2 flex items-center gap-2 text-xs font-medium text-primary"><Sparkles className="h-4 w-4" />A couple of details to narrow this down</p><div className="space-y-2 text-sm leading-relaxed">{current.questions?.map(q => <p key={q.topic}>{q.question}</p>)}</div><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" size="sm" className="rounded-full" onClick={() => input.current?.focus()}>Add details<ArrowDownIcon /></Button><Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setProjects(prev => prev.map(p => p.id === activeId ? { ...p, turns: p.turns.map((t, i) => i === p.turns.length - 1 ? { ...t, questionsSkipped: true } : t) } : p))}>Skip for now</Button></div></section>}
              <div className="mb-5 mt-8"><h1 className="text-xl font-semibold">{current.matches.length ? "Your manufacturer matches" : "No listed manufacturers match this request yet"}</h1><p className="mt-1 text-xs text-muted-foreground">{current.matches.length ? "Matched against the Snaplogo directory. Prices and availability need supplier confirmation." : "Try a different packaging format, or adjust your quantity and customization requirements."}</p></div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{current.matches.map(match => { const m = manufacturers.find(v => v.id === match.id); return m ? <SourcingSupplier key={m.id} manufacturer={m} reason={match.reason} saved={saved.includes(m.id)} onSave={() => toggleSave(m.id)} requirement={sourcingRequest(turns, "")} /> : null; })}</div>
              {current.matches.length > 0 && <Button onClick={() => setTab("compare")} variant="ghost" className="mt-4 text-primary"><SlidersHorizontal />Compare saved suppliers<ArrowRight /></Button>}
            </>}
            <div className="mt-8">{composer(true)}</div>
          </div>}

          {tab === "saved" && <div className="py-10"><div className="mb-6 flex items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">Saved suppliers</h1><p className="mt-1 text-sm text-muted-foreground">Your shortlist, ready for the next conversation.</p></div>{shortlist.length > 0 && <Button variant="outline" onClick={() => setTab("compare")} className="rounded-full"><SlidersHorizontal />Compare</Button>}</div>{shortlist.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{shortlist.map(m => <SourcingSupplier key={m.id} manufacturer={m} reason={m.description} saved onSave={() => toggleSave(m.id)} requirement={turns.map(t => t.query).join("\n") || "Please share your packaging options, minimum order and pricing."} />)}</div> : <EmptyState title="Your shortlist starts here" onSource={() => setTab("source")} />}</div>}

          {tab === "compare" && <div className="py-10"><h1 className="text-2xl font-semibold">Compare suppliers</h1><p className="mt-1 text-sm text-muted-foreground">The facts side by side. Unknown details stay open questions.</p>{shortlist.length ? <div className="mt-8 overflow-x-auto rounded-lg border border-border bg-card"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr><th className="min-w-40 p-4 text-xs font-normal text-muted-foreground">Supplier details</th>{shortlist.map(m => <th key={m.id} className="min-w-52 p-4"><div className="flex items-center justify-between gap-2">{m.name}<Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleSave(m.id)} aria-label={`Remove ${m.name}`}><X /></Button></div></th>)}</tr></thead><tbody>{[{ label: "Location", value: (m: DirectoryManufacturer) => placeOf(m) || "Ask supplier" }, { label: "Minimum order", value: (m: DirectoryManufacturer) => m.minimum_order_quantities.map(f => `${f.value} (${f.scope})`).join("; ") || "Ask supplier" }, { label: "Lead time", value: (m: DirectoryManufacturer) => m.lead_times.map(f => `${f.value} (${f.scope})`).join("; ") || "Ask supplier" }, { label: "Customization", value: (m: DirectoryManufacturer) => m.customization_capabilities.map(c => CUSTOMIZATION[c]).join(", ") || "Ask supplier" }, { label: "Unit pricing", value: () => "Request a quote" }].map(row => <tr key={row.label} className="border-t border-border"><th className="p-4 text-xs font-medium text-muted-foreground">{row.label}</th>{shortlist.map(m => <td key={m.id} className="p-4 text-xs leading-relaxed">{row.value(m)}</td>)}</tr>)}<tr className="border-t border-border"><th className="p-4 text-xs font-medium text-muted-foreground">More details</th>{shortlist.map(m => <td key={m.id} className="p-4"><Button asChild variant="outline" size="sm" className="rounded-full"><Link to={`/manufacturers/${m.slug}`}>View profile<ExternalLink /></Link></Button></td>)}</tr></tbody></table></div> : <EmptyState title="Save suppliers to compare them" onSource={() => setTab("source")} />}</div>}
          {error && <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-card p-4 text-sm text-destructive"><span className="flex-1">{error}</span><Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Dismiss error" onClick={() => setError("")}><X /></Button></div>}
        </main>
      </div>
    </div>
  );
}

function EmptyState({ title, onSource }: { title: string; onSource: () => void }) {
  return <div className="py-20 text-center"><Bookmark className="mx-auto h-8 w-8 text-muted-foreground" /><h2 className="mt-4 text-lg font-semibold">{title}</h2><Button className="mt-5 rounded-full" onClick={onSource}><Search />Find manufacturers</Button></div>;
}

function ArrowUpRightIcon() { return <ExternalLink className="!h-3 !w-3" />; }
function ArrowDownIcon() { return <ArrowUp className="h-3 w-3 rotate-180" />; }