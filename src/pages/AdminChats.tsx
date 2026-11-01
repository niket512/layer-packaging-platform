import { useEffect, useState } from "react";
import { MessageSquare, RefreshCw, Search, ShieldCheck, ArrowLeft, Phone } from "lucide-react";
import AppShell, { SignInBox, useSession } from "@/components/market/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SourcingTurn } from "@/lib/sourcing";
import { BRIEF_LABELS } from "@/lib/sourcing";
import type { SourcingBriefField } from "../../supabase/functions/_shared/sourcing-intake";

type Chat = { id: string; title: string; status: string; contact: string | null; updated_at: string; created_at: string; transcript: SourcingTurn[]; brief: SourcingBriefField[]; requirement?: string; images?: string[] };
const date = (value: string) => new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function AdminChats() {
  const { user, roles, loading } = useSession();
  const isAdmin = roles.includes("admin");
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const refresh = async () => {
    if (!isAdmin) return;
    setRefreshing(true);
    try {
      // Page through both sources so historical requests are not hidden by an API row limit.
      const rows = [];
      const submissions = [];
      for (let offset = 0; ; offset += 500) {
        const result = await supabase.from("sourcing_chats").select("id,title,status,contact,updated_at,created_at,transcript,brief,submission_id").order("updated_at", { ascending: false }).range(offset, offset + 499);
        if (result.error) throw result.error;
        rows.push(...(result.data ?? []));
        if ((result.data?.length ?? 0) < 500) break;
      }
      for (let offset = 0; ; offset += 500) {
        const result = await supabase.from("requirement_submissions").select("id,contact,requirement,images,created_at").order("created_at", { ascending: false }).range(offset, offset + 499);
        if (result.error) throw result.error;
        submissions.push(...(result.data ?? []));
        if ((result.data?.length ?? 0) < 500) break;
      }
      const linked = new Set(rows.map(row => row.submission_id));
      const combined: Chat[] = [
        ...rows.map(row => ({ ...row, transcript: Array.isArray(row.transcript) ? row.transcript as unknown as SourcingTurn[] : [], brief: Array.isArray(row.brief) ? row.brief as unknown as SourcingBriefField[] : [] })),
        ...submissions.filter(row => !linked.has(row.id)).map(row => ({ id: row.id, title: row.requirement.split("\n").find(line => line.trim() && !line.startsWith("Sourcing brief"))?.slice(0, 120) ?? "Submitted request", status: "submitted", contact: row.contact, updated_at: row.created_at, created_at: row.created_at, transcript: [], brief: [], requirement: row.requirement, images: row.images })),
      ];
      setChats(combined.sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
      setError(""); setLoaded(true); setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    } catch { setError("Couldn’t load chats. Please try refreshing."); }
    finally { setRefreshing(false); }
  };
  useEffect(() => {
    if (!isAdmin) return;
    void refresh();
    const timer = window.setInterval(() => void refresh(), 10000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (loading) return <AppShell><p role="status">Loading…</p></AppShell>;
  if (!user) return <AppShell><SignInBox title="Sign in to view chats" /></AppShell>;
  if (!isAdmin) return <AppShell user={user}><div className="py-12 text-center"><ShieldCheck className="mx-auto mb-4 text-primary" /><h1 className="text-2xl font-semibold">Administrator access required</h1><p className="mt-2 text-muted-foreground">Your account does not have permission to view customer chats.</p></div></AppShell>;

  const visible = chats.filter(chat => (filter === "all" || chat.status === filter) && `${chat.title} ${chat.contact ?? ""} ${chat.requirement ?? ""} ${chat.transcript.map(t => t.query).join(" ")}`.toLowerCase().includes(search.toLowerCase()));
  const selected = visible.find(chat => chat.id === selectedId);
  return <AppShell user={user} isAdmin>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-primary"><ShieldCheck className="h-3.5 w-3.5" />Private workspace</p><h1 className="text-3xl font-bold">Chats <span className="text-lg font-normal text-muted-foreground">{chats.length}</span></h1></div><div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">{lastUpdated && `Updated ${lastUpdated}`}</span><Button variant="outline" size="icon" onClick={() => void refresh()} disabled={refreshing} aria-label="Refresh chats" title="Refresh chats"><RefreshCw className={refreshing ? "animate-spin" : ""} /></Button></div></div>
    {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><Tabs value={filter} onValueChange={setFilter}><TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="ongoing">Ongoing</TabsTrigger><TabsTrigger value="submitted">Submitted</TabsTrigger></TabsList></Tabs><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chats or contact…" aria-label="Search chats" className="pl-9" /></div></div>
    <div className="grid min-h-[600px] overflow-hidden rounded-lg border border-border bg-background md:grid-cols-[320px_minmax(0,1fr)]">
      <aside aria-label="Chat list" className={`max-h-[750px] overflow-y-auto border-border md:border-r ${selected ? "hidden md:block" : ""}`}>
        {!visible.length && <p className="p-6 text-sm text-muted-foreground">{!loaded ? "Loading chats…" : search || filter !== "all" ? "No matching chats." : "No chats yet."}</p>}
        {visible.map(chat => <Button variant="ghost" key={chat.id} onClick={() => setSelectedId(chat.id)} className={`h-auto w-full justify-start rounded-none border-b border-border p-4 text-left ${selectedId === chat.id ? "bg-accent" : ""}`}><span className="block min-w-0 w-full"><span className="mb-2 flex items-center justify-between gap-2 text-xs"><span className={chat.status === "submitted" ? "text-primary" : "text-muted-foreground"}>{chat.status === "submitted" ? "Submitted" : "Ongoing"}</span><span className="font-normal text-muted-foreground">{date(chat.updated_at)}</span></span><span className="block whitespace-normal break-words text-sm font-semibold">{chat.title}</span><span className="mt-2 block truncate text-xs font-normal text-muted-foreground">{chat.contact ?? "Contact not shared"}</span></span></Button>)}
      </aside>
      <section aria-label="Conversation" className={`min-w-0 ${selected ? "" : "hidden md:flex md:items-center md:justify-center"}`}>
        {!selected ? <div className="p-8 text-center text-muted-foreground"><MessageSquare className="mx-auto mb-3 h-8 w-8" /><p>Select a conversation</p></div> : <>
          <header className="border-b border-border p-4"><Button variant="ghost" size="sm" className="mb-2 md:hidden" onClick={() => setSelectedId(null)}><ArrowLeft />All chats</Button><h2 className="break-words text-lg font-semibold">{selected.title}</h2><div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><span>Started {date(selected.created_at)}</span>{selected.contact && <a className="flex items-center gap-1 text-primary" href={`tel:${selected.contact.replace(/[^+\d]/g, "")}`}><Phone className="h-3 w-3" />{selected.contact}</a>}</div></header>
          <div className="max-h-[650px] space-y-5 overflow-y-auto p-4 sm:p-6">
            {selected.brief.length > 0 && <details className="border-b border-border pb-4"><summary className="cursor-pointer text-sm font-semibold">Packaging brief</summary><dl className="mt-3 space-y-2 text-sm">{selected.brief.map(field => <div key={field.topic}><dt className="text-xs text-muted-foreground">{BRIEF_LABELS[field.topic] ?? field.topic}</dt><dd className="break-words">{field.value}</dd></div>)}</dl></details>}
            {selected.requirement && <><p className="text-xs text-muted-foreground">Historical saved request · full assistant replies may not be available.</p><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{selected.requirement}</p><Photos images={selected.images} /></>}
            {selected.transcript.map((turn, i) => <div key={i} className="space-y-3"><div className="ml-auto max-w-[90%] rounded-lg bg-accent p-3"><p className="mb-1 text-xs font-semibold text-primary">Customer</p><p className="whitespace-pre-wrap break-words text-sm">{turn.query}</p><Photos images={turn.images} /></div>{(turn.assistantMessage || turn.questions?.length || turn.followUp) && <div className="mr-auto max-w-[95%] rounded-lg border border-border p-3"><p className="mb-1 text-xs font-semibold text-muted-foreground">Snaplogo</p>{turn.assistantMessage && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{turn.assistantMessage}</p>}{turn.questions?.map(question => <p key={question.topic} className="mt-2 text-sm">{question.question}</p>)}{turn.followUp && <p className="mt-2 text-sm">{turn.followUp === "design" ? "Do you have any design with you? (optional)" : "We’ll take your requirements to our manufacturer network and share quotations within 24 hours. Kindly share your phone number to keep you updated."}</p>}</div>}</div>)}
          </div>
        </>}
      </section>
    </div>
  </AppShell>;
}

function Photos({ images }: { images?: string[] }) {
  return <div className="mt-2 flex flex-wrap gap-2">{images?.map((image, i) => /^data:image\/(jpeg|png|webp);base64,/.test(image) ? <a key={i} href={image} download={`reference-${i + 1}.jpg`}><img src={image} alt={`Reference ${i + 1}`} className="h-24 w-24 rounded border border-border object-contain" /></a> : null)}</div>;
}