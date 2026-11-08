import { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowUp, FileText, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { briefFields, choices, fieldLabels, questions, validateRequestFile } from "@/lib/parseBrief";
import { messageBase, requestReducer, restoreRequest, REQUEST_KEY, sendMessage, type RequestFile, type RequestMessage } from "@/lib/request-chat";
import "./RequestPreview.css";

export default function RequestPreview() {
  const [state, dispatch] = useReducer(requestReducer, undefined, restoreRequest);
  const stateRef = useRef(state); stateRef.current = state;
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [error, setError] = useState("");
  const [attachment, setAttachment] = useState<RequestFile>();
  const [confirm, setConfirm] = useState(false);
  const [newMessage, setNewMessage] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [quotesNotice, setQuotesNotice] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const thread = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const bottom = useRef(true);
  const failUsed = useRef(false);
  const locked = useRef(false);
  const initialIds = useRef(new Set(state.messages.map(m => m.id)));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const queue = useRef<RequestMessage[]>([]);
  const latest = state.messages.at(-1);
  const count = briefFields.filter(f => state.brief[f]).length;
  const focus = () => input.current?.focus({ preventScroll: true });
  const schedule = (fn: () => void, delay: number) => { const timer = setTimeout(fn, delay); timers.current.push(timer); return timer; };
  const scrollDown = () => { if (thread.current) thread.current.scrollTop = thread.current.scrollHeight; bottom.current = true; setNewMessage(false); };

  useEffect(() => {
    try { localStorage.setItem(REQUEST_KEY, JSON.stringify(state)); } catch { setError("This browser cannot save your chat. Keep this tab open to retain it."); }
  }, [state]);
  useEffect(() => {
    focus();
    const viewport = window.visualViewport;
    const resize = () => { shell.current?.style.setProperty("--request-height", `${viewport?.height ?? window.innerHeight}px`); if (bottom.current) scrollDown(); };
    resize(); viewport?.addEventListener("resize", resize);
    const onOnline = () => setOnline(true); const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline); window.addEventListener("offline", onOffline);
    return () => { viewport?.removeEventListener("resize", resize); window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); timers.current.forEach(clearTimeout); };
  }, []);
  useLayoutEffect(() => { if (bottom.current) scrollDown(); else setNewMessage(true); }, [state.messages, typing]);
  useLayoutEffect(() => { if (input.current) { input.current.style.height = "auto"; input.current.style.height = `${Math.min(140, input.current.scrollHeight)}px`; } }, [state.draft]);

  const process = async (message: RequestMessage) => {
    if (locked.current) return;
    locked.current = true; setBusy(true);
    const typingTimer = schedule(() => setTyping(true), 250);
    try {
      if (import.meta.env.DEV && new URLSearchParams(location.search).get("fail") === "1" && !failUsed.current) {
        failUsed.current = true; await new Promise(resolve => schedule(() => resolve(undefined), 800)); throw new Error("Message not sent");
      }
      const current = stateRef.current;
      const companion = message.kind === "file" ? current.messages.findLast(m => m.role === "user" && m.kind === "text" && m.createdAt >= message.createdAt) : undefined;
      const reply = await sendMessage(current.messages, { text: message.kind === "text" ? message.text : companion?.kind === "text" ? companion.text : "", brief: current.brief, field: current.field, unclear: current.unclear, file: message.kind === "file" ? message.file : undefined });
      dispatch({ type: "sent", id: message.id }); dispatch({ type: "reply", reply });
    } catch { dispatch({ type: "failed", id: message.id }); }
    finally { clearTimeout(typingTimer); setTyping(false); setBusy(false); locked.current = false; focus(); }
  };
  useEffect(() => {
    if (!online || busy || locked.current || queue.current.length === 0) return;
    const next = queue.current.shift(); if (next) void process(next);
  }, [online, busy]);
  const send = (text = state.draft) => {
    if (busy || (!text.trim() && !attachment)) return;
    const message: RequestMessage = attachment ? { ...messageBase("user"), kind: "file", file: attachment, progress: 0, state: "sending" } : { ...messageBase("user"), kind: "text", text: text.trim(), state: "sending" };
    dispatch({ type: "message", message }); setAttachment(undefined); setError("");
    if (attachment && text.trim()) dispatch({ type: "message", message: { ...messageBase("user"), kind: "text", text: text.trim() } });
    if (!online) queue.current.push(message); else void process(message);
    focus();
  };
  const attach = async (file?: File) => {
    if (!file) return;
    const invalid = validateRequestFile(file); if (invalid) { setError(invalid); return; }
    let url: string | undefined;
    if (file.type.startsWith("image/")) {
      url = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(); reader.onerror = reject; reader.readAsDataURL(file); }).catch(() => undefined);
    }
    setAttachment({ name: file.name, size: file.size, type: file.type, url }); setError("");
  };
  const find = () => {
    if (state.step !== 0 || count !== 4) return;
    const message: RequestMessage = { ...messageBase("assistant"), kind: "status", text: "Matching your brief with manufacturers...", complete: false };
    dispatch({ type: "message", message }); dispatch({ type: "step", step: 1 });
    schedule(() => dispatch({ type: "matched", id: message.id }), 3000);
  };
  const reset = () => { timers.current.forEach(clearTimeout); queue.current = []; dispatch({ type: "reset" }); setConfirm(false); setAttachment(undefined); setError(""); setTyping(false); failUsed.current = false; focus(); };

  return <div ref={shell} className="request-preview bg-background text-foreground">
    <Helmet><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700&family=Figtree:wght@400;500;600&display=swap" /></Helmet>
    <div className="mx-auto flex h-full max-w-[480px] flex-col border-x border-border">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3"><span className="request-wordmark text-xl font-bold">snaplogo<span className="text-primary">.</span></span><Button variant="outline" disabled={busy} onClick={() => count ? setConfirm(true) : reset()} className="h-11 rounded-full text-sm">New request</Button></header>
      <div className="shrink-0 px-4 py-3" aria-label="Request progress"><ol className="grid grid-cols-3 gap-2">{["Tell us your needs", "We match makers", "Compare quotes"].map((label, i) => <li key={label} aria-current={state.step === i ? "step" : undefined}><div className={`mb-1.5 h-1 rounded-full ${i < state.step ? "progress-done" : i === state.step ? "bg-primary" : "bg-border"}`} /><span className={`text-[11px] font-medium ${i === state.step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span></li>)}</ol></div>
      <section aria-label="Your brief" className="shrink-0 border-b border-border px-4 pb-3"><div className="mb-2 flex justify-between text-xs"><h2 className="font-semibold">Your brief</h2><span className="text-muted-foreground">{count} of 4</span></div><div className="grid grid-cols-2 gap-2">{briefFields.map(field => <Button key={`${field}-${state.brief[field] ?? ""}`} variant="outline" disabled={!state.brief[field] || busy || state.step === 1} onClick={() => { dispatch({ type: "edit", field }); focus(); }} className={`h-auto min-h-11 justify-start whitespace-normal rounded-full px-3 py-2 text-left text-xs ${state.brief[field] ? "brief-pop border-primary/20 bg-accent text-foreground" : "brief-empty border-dashed text-muted-foreground disabled:opacity-100"}`}>{fieldLabels[field]}{state.brief[field] ? `: ${state.brief[field]}` : ""}</Button>)}</div></section>
      <div ref={thread} role="log" aria-live="polite" aria-relevant="additions" onScroll={() => { const el = thread.current; if (el) { bottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60; if (bottom.current) setNewMessage(false); } }} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        <p className="mb-3 text-xs text-muted-foreground">Snaplogo assistant</p>
        {state.messages.map((message, index) => {
          const previous = state.messages[index - 1]; const next = state.messages[index + 1]; const first = previous?.role !== message.role; const last = next?.role !== message.role;
          return <div key={message.id} className={`message-wrapper flex items-start gap-2 ${first ? "mt-4" : "mt-1"} ${initialIds.current.has(message.id) ? "" : "new-bubble"} ${selectedTime === message.id ? "show-time" : ""}`} onClick={() => setSelectedTime(selectedTime === message.id ? "" : message.id)}>
            {message.role === "assistant" && <span className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary ${first ? "" : "invisible"}`} aria-hidden="true">s</span>}
            <Message from={message.role} className="max-w-[85%] min-w-0">
              <MessageContent className={`w-fit max-w-full rounded-[18px] px-3.5 py-3 text-base leading-relaxed [overflow-wrap:anywhere] ${message.role === "user" ? `user-content group-[.is-user]:rounded-[18px] group-[.is-user]:bg-foreground group-[.is-user]:text-background ${last ? "rounded-br-md" : ""}` : `border border-border bg-card ${last ? "rounded-bl-md" : ""}`}`}>
                {(message.kind === "text" || message.kind === "chips" || message.kind === "error") && <MessageResponse>{message.text}</MessageResponse>}
                {message.kind === "chips" && latest?.id === message.id && !busy && <div role="group" aria-label={questions[message.field]} className="mt-2 flex flex-wrap gap-2">{[...choices[message.field], ...(message.callback ? ["Request a callback"] : []), "Other"].map(choice => <Button variant="outline" key={choice} onClick={e => { e.stopPropagation(); if (choice === "Other") focus(); else if (choice === "Request a callback") { dispatch({ type: "message", message: { ...messageBase("assistant"), kind: "text", text: "Share your phone number in the live sourcing chat to request a callback." } }); } else send(choice); }} className="min-h-11 rounded-full border-border bg-background px-3 text-sm font-medium">{choice}</Button>)}</div>}
                {message.kind === "file" && <div className="flex min-w-0 items-center gap-2">{message.file.url ? <img src={message.file.url} alt={message.file.name} className="h-12 w-12 rounded-lg object-cover" /> : <FileText className="h-6 w-6 shrink-0" />}<span className="min-w-0"><span className="block break-all text-sm">{message.file.name}</span><span className="text-xs">{(message.file.size / 1024 / 1024).toFixed(1)} MB</span>{message.state === "sending" && <progress aria-label="Upload progress" value={message.progress} max={100} className="mt-1 block h-1 w-full" />}</span></div>}
                {message.kind === "summary" && <div><h2 className="mb-2 font-bold">Your packaging brief</h2><dl className="divide-y divide-border">{briefFields.map(field => <div key={field} className="py-2"><dt className="text-xs text-muted-foreground">{fieldLabels[field]}</dt><dd className="text-sm font-medium">{message.brief[field]}</dd></div>)}</dl>{latest?.id === message.id && <div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" className="min-h-11 rounded-full" onClick={() => dispatch({ type: "edit", field: "product" })}>Edit brief</Button><Button onClick={find} className="min-h-11 rounded-full">Find manufacturers</Button></div>}</div>}
                {message.kind === "status" && <div><p>{message.text}</p>{!message.complete ? <progress aria-label="Matching progress" className="mt-3 h-1 w-full" /> : <Button variant="outline" onClick={() => setQuotesNotice(true)} className="mt-3 min-h-11 rounded-full">Preview sample quotes</Button>}</div>}
              </MessageContent>
              {message.state === "sending" && <span className="text-xs text-muted-foreground">Sending...</span>}
              {message.state === "failed" && <div className="flex items-center gap-2 text-xs text-destructive"><span>Message not sent</span><Button variant="outline" disabled={busy || !online} onClick={() => void process(message)} className="min-h-11 rounded-full">Retry</Button></div>}
              <span className="message-time text-[10px] text-muted-foreground">{new Date(message.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</span>
            </Message>
          </div>;
        })}
        {typing && <div role="status" aria-label="Snaplogo is typing" className="ml-9 mt-4 flex w-fit gap-1.5 rounded-[18px] rounded-bl-md border border-border bg-card px-4 py-4">{[1, 2, 3].map(n => <span key={n} className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" />)}</div>}
      </div>
      <div className="shrink-0 border-t border-border bg-card p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        {newMessage && <div className="mb-2 text-center"><Button variant="outline" onClick={scrollDown} className="min-h-11 rounded-full">New message</Button></div>}
        {!online && <p role="status" className="mb-2 text-xs text-muted-foreground">You're offline. Messages will send when you reconnect.</p>}
        {error && <p role="alert" className="mb-2 text-sm text-destructive">{error}</p>}
        {attachment && <div className="mb-2 flex items-center gap-2 rounded-lg border border-border p-2">{attachment.url ? <img src={attachment.url} alt="Attachment preview" className="h-10 w-10 rounded object-cover" /> : <FileText className="h-5 w-5" />}<span className="min-w-0 flex-1 truncate text-xs">{attachment.name} · {(attachment.size / 1048576).toFixed(1)} MB</span><Button variant="ghost" size="icon" aria-label="Remove attachment" className="h-11 w-11" onClick={() => setAttachment(undefined)}><X /></Button></div>}
        <PromptInput onSubmit={() => send()} className="[&>[data-slot=input-group]]:rounded-[18px] [&>[data-slot=input-group]]:bg-background">
          <PromptInputTextarea ref={input} value={state.draft} rows={1} onChange={e => dispatch({ type: "draft", text: e.target.value })} onKeyDown={e => { if (e.key === "Enter" && matchMedia("(pointer: coarse)").matches) { e.preventDefault(); const node = e.currentTarget; const start = node.selectionStart; dispatch({ type: "draft", text: state.draft.slice(0, start) + "\n" + state.draft.slice(node.selectionEnd) }); requestAnimationFrame(() => node.setSelectionRange(start + 1, start + 1)); } }} placeholder="Describe your packaging, or tap an option above" className="min-h-11 max-h-[140px] resize-none text-base" aria-label="Packaging message" />
          <PromptInputFooter><Button variant="ghost" type="button" disabled={busy} onClick={() => upload.current?.click()} className="h-11 px-2 text-sm text-muted-foreground"><ImagePlus className="h-4 w-4" />Upload design</Button><PromptInputSubmit aria-label="Send message" status={busy ? "submitted" : "ready"} disabled={busy || (!state.draft.trim() && !attachment)} className="h-11 w-11 rounded-full"><ArrowUp className="h-5 w-5" /></PromptInputSubmit></PromptInputFooter>
        </PromptInput>
        <input type="file" ref={upload} hidden accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.ai" onChange={e => { void attach(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
    </div>
    <AlertDialog open={confirm} onOpenChange={setConfirm}><AlertDialogContent className="request-preview h-auto bg-card text-foreground"><AlertDialogHeader><AlertDialogTitle>Start a new request?</AlertDialogTitle><AlertDialogDescription>Your current conversation and brief will be cleared.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep request</AlertDialogCancel><AlertDialogAction onClick={reset}>New request</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={quotesNotice} onOpenChange={setQuotesNotice}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Quotes coming next</AlertDialogTitle><AlertDialogDescription>The quote preview will be added after your chat feedback.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogAction>Continue</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}