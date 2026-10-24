import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Phone, Send, ShieldCheck, Sparkles, User, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { imageFileToDataUrl } from "@/lib/image-data-url";
import {
  readSaved,
  sourcingRequest,
  sourcingSubmission,
  validSourcingPhone,
  validatedQuestions,
  type SourcingProject,
  type SourcingTurn,
} from "@/lib/sourcing";

const STORAGE_KEY = "snaplogo.sourcing";
const STEPS = [
  { title: "Describe need", sub: "Tell us what you're looking for" },
  { title: "Add details", sub: "A few quick questions" },
  { title: "Request a call", sub: "We reach out with details" },
];

type Phase = "describe" | "questions" | "phone" | "done";

export default function SourcingAgent() {
  const [project, setProject] = useState<SourcingProject>(() =>
    readSaved<SourcingProject>(STORAGE_KEY, { id: crypto.randomUUID(), title: "", turns: [] }),
  );
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const turns = project.turns;
  const lastTurn = turns[turns.length - 1];
  const pendingQuestions = lastTurn && !lastTurn.questionsSkipped ? (lastTurn.questions ?? []) : [];
  const phase: Phase = project.submitted
    ? "done"
    : !turns.length
      ? "describe"
      : pendingQuestions.length
        ? "questions"
        : "phone";

  useEffect(() => {
    document.title = "Snaplogo sourcing — tell us what you need";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Describe your packaging requirement, answer a couple of quick questions, and our team reaches out with the right manufacturers.");
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(project)); } catch { /* ignore */ }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [project]);

  const addImages = async (files: FileList | null) => {
    if (!files) return;
    const room = 4 - images.length;
    for (const f of Array.from(files).slice(0, room)) {
      try { setImages((p) => [...p, await imageFileToDataUrl(f, 800)]); } catch { /* skip bad files */ }
    }
  };

  const askQuestions = async (nextTurns: SourcingTurn[]) => {
    setBusy(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("directory-search", {
        body: {
          mode: "intake",
          query: sourcingRequest(nextTurns.slice(0, -1), nextTurns[nextTurns.length - 1].query),
          conversation: nextTurns.map((t) => t.query),
        },
      });
      if (fnError) throw fnError;
      const questions = validatedQuestions(data?.questions, nextTurns);
      setProject((p) => {
        const copy = [...p.turns];
        copy[copy.length - 1] = { ...copy[copy.length - 1], questions };
        return { ...p, turns: copy };
      });
    } catch {
      setError("Couldn't load the follow-up questions — you can continue anyway.");
      setProject((p) => {
        const copy = [...p.turns];
        copy[copy.length - 1] = { ...copy[copy.length - 1], questions: [] };
        return { ...p, turns: copy };
      });
    } finally {
      setBusy(false);
    }
  };

  const send = () => {
    const q = text.trim();
    if (!q && !images.length) return;
    const turn: SourcingTurn = { query: q || "(photos attached)", matches: [], images };
    const nextTurns = [...turns, turn];
    setProject((p) => ({ ...p, turns: nextTurns, title: p.title || q.slice(0, 60) }));
    setText("");
    setImages([]);
    void askQuestions(nextTurns);
  };

  const skipQuestions = () => {
    setProject((p) => {
      const copy = [...p.turns];
      copy[copy.length - 1] = { ...copy[copy.length - 1], questionsSkipped: true };
      return { ...p, turns: copy };
    });
  };

  const submitPhone = async () => {
    const raw = phone.trim();
    if (!validSourcingPhone(raw)) {
      // Not a phone number — treat it as extra details and keep the conversation going.
      if (raw) {
        const nextTurns = [...turns, { query: raw, matches: [] }];
        setProject((p) => ({ ...p, turns: nextTurns }));
        setPhone("");
        await askQuestions(nextTurns);
      }
      return;
    }
    const normalised = raw.replace(/\D/g, "").length === 10 ? `+91 ${raw}` : raw;
    const payload = sourcingSubmission(turns, normalised);
    if (!payload) return;
    setBusy(true);
    setError("");
    const { error: insError } = await supabase.from("requirement_submissions").insert(payload);
    setBusy(false);
    if (insError) { setError("Something went wrong sending your request — please try again."); return; }
    setProject((p) => ({ ...p, submitted: true, phone: normalised }));
  };

  const reset = () => {
    setProject({ id: crypto.randomUUID(), title: "", turns: [] });
    setText(""); setImages([]); setPhone(""); setError("");
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const stepIndex = phase === "describe" ? 0 : phase === "questions" ? 1 : 2;

  return (
    <div className="theme-directory min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-[720px] px-4 pb-16 md:px-6">
        <header className="flex items-center justify-between border-b border-border py-4">
          <a href="/manufacturers" className="text-lg font-bold">snaplogo<span className="text-primary">.</span></a>
          <a href="/manufacturers" className="text-xs text-muted-foreground hover:text-foreground">← Find manufacturers</a>
        </header>

        {/* Progress */}
        <ol aria-label="Sourcing progress" className="mt-6 grid grid-cols-3 gap-2 rounded-xl border border-border bg-card p-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex items-start gap-2">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${i < stepIndex || phase === "done" ? "bg-primary text-primary-foreground" : i === stepIndex ? "border border-primary text-primary" : "bg-muted text-muted-foreground"}`}>
                {i < stepIndex || phase === "done" ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className={`block text-xs font-semibold ${i <= stepIndex ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</span>
                <span className="block truncate text-[10px] text-muted-foreground">{s.sub}</span>
              </span>
            </li>
          ))}
        </ol>

        {/* Conversation */}
        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></span>
            <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed">
              Hi! Tell me what packaging you need — product, quantity, size, city, anything you know. You can also add photos of references.
            </div>
          </div>

          {turns.map((t, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-start justify-end gap-2.5">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
                  <p className="whitespace-pre-wrap">{t.query}</p>
                  {!!t.images?.length && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {t.images.map((src, j) => <img key={j} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />)}
                    </div>
                  )}
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><User className="h-4 w-4" /></span>
              </div>
              {!!t.questions?.length && !t.questionsSkipped && i === turns.length - 1 && (
                <div className="flex items-start gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></span>
                  <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">A few quick details would help</p>
                    <ol className="mt-2 space-y-1.5 text-sm">
                      {t.questions.map((q, j) => (
                        <li key={q.topic} className="flex gap-2"><span className="font-semibold text-primary">{j + 1}.</span>{q.question}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
              {!!t.questionsSkipped && i === turns.length - 1 && (
                <div className="flex items-start gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></span>
                  <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm">No problem — we'll work with what you've shared.</div>
                </div>
              )}
            </div>
          ))}

          {busy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles className="h-4 w-4 animate-pulse" /></span>
              Thinking…
            </div>
          )}

          {phase === "phone" && !busy && (
            <div className="flex items-start gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Phone className="h-4 w-4" /></span>
              <div className="w-full max-w-[420px] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-4">
                <p className="text-sm font-semibold">What's your phone number?</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Someone from our team will reach out to you with the relevant details.</p>
                <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 focus-within:border-primary">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">+91</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void submitPhone()}
                    inputMode="tel"
                    placeholder="98765 43210"
                    aria-label="Phone number"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  />
                  <button
                    type="button"
                    onClick={() => void submitPhone()}
                    disabled={busy}
                    aria-label="Send phone number"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground"><ShieldCheck className="h-3 w-3" /> Your information is safe with us</p>
              </div>
            </div>
          )}

          {phase === "done" && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-5 w-5" /></span>
              <h2 className="mt-3 text-lg font-semibold">Request received</h2>
              <p className="mx-auto mt-1 max-w-[380px] text-sm text-muted-foreground">
                Someone from our team will reach out to you on <span className="font-medium text-foreground">{project.phone}</span> with the relevant details.
              </p>
              <button type="button" onClick={reset} className="mt-4 text-sm font-semibold text-primary hover:underline">Start a new sourcing request</button>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        {phase !== "done" && (
          <div className="sticky bottom-0 mt-6 bg-background/95 pb-3 pt-2 backdrop-blur">
            {!!images.length && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {images.map((src, i) => (
                  <span key={i} className="relative">
                    <img src={src} alt="" className="h-14 w-14 rounded-lg border border-border object-cover" />
                    <button type="button" aria-label="Remove photo" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-card text-muted-foreground shadow"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 focus-within:border-primary">
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { void addImages(e.target.files); e.target.value = ""; }} />
              <button type="button" onClick={() => fileRef.current?.click()} aria-label="Add photos" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
                <ImagePlus className="h-4.5 w-4.5" />
              </button>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1}
                placeholder={phase === "questions" ? "Answer here, or skip below…" : "e.g. 10,000 stand-up pouches for coffee, 250 g, delivered in Bengaluru"}
                aria-label="Your message"
                className="max-h-32 w-full resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground/60"
              />
              <button type="button" onClick={send} disabled={busy || (!text.trim() && !images.length)} aria-label="Send message" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
              {phase === "questions" ? (
                <button type="button" onClick={skipQuestions} className="font-medium text-primary hover:underline">Skip for now</button>
              ) : <span />}
              <span>Snaplogo sourcing · photos {images.length}/4</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
