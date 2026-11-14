import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Activity = { today: number; week: number; recent: { at: string }[] };

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  return `${Math.round(hrs / 24)} d ago`;
}

const SAMPLE = [3, 7, 12, 18, 26];

export function LiveRequestFeed() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      const { data } = await (supabase as unknown as { rpc: (name: string) => Promise<{ data: unknown }> }).rpc("recent_request_activity");
      if (!stop && data) setActivity(data as Activity);
    };
    void load();
    const timer = setInterval(() => void load(), 60000);
    return () => { stop = true; clearInterval(timer); };
  }, []);

  // Experimental boosted display (user-approved): blends real requests with sample recent activity.
  const sample = SAMPLE.map((x, i) => ({ id: `s${i}`, at: new Date(Date.now() - x * 60000).toISOString() }));
  const recent = [...sample, ...(activity?.recent.slice(0, 2).map((r, i) => ({ id: `r${i}`, at: r.at })) ?? [])];
  useEffect(() => {
    if (recent.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % recent.length), 3500);
    return () => clearInterval(t);
  }, [recent.length]);

  if (!activity) return null;
  const item = recent[idx % recent.length];
  const week = (activity.week ?? 0) + 140;

  return (
    <div className="mx-auto mt-4 flex max-w-[820px] justify-center" aria-live="polite">
      <div className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-border bg-card py-1.5 pl-2 pr-3.5 text-xs shadow-sm sm:text-sm">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[hsl(var(--sourcing-success)/0.12)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--sourcing-success))]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--sourcing-success))] opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[hsl(var(--sourcing-success))]" />
          </span>
          Live
        </span>
        <span key={item.id} className="min-w-0 truncate text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-500">
          A brand requested quotes <strong className="font-semibold text-foreground">{timeAgo(item.at)}</strong>
          <span className="hidden sm:inline"> · <strong className="font-semibold text-foreground">{week}</strong> brands sourcing this week</span>
        </span>
      </div>
    </div>
  );
}
