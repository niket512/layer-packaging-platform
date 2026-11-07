import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Activity = { today: number; week: number; recent: { id: string; at: string }[] };

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  return `${Math.round(hrs / 24)} d ago`;
}

export function LiveRequestFeed() {
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      // recent_request_activity is a security-definer RPC added after types were generated.
      const rpc = supabase.rpc as unknown as (name: string) => Promise<{ data: unknown }>;
      const { data } = await rpc("recent_request_activity");
      if (!stop && data) setActivity(data as Activity);
    };
    void load();
    const timer = setInterval(() => void load(), 60000);
    return () => { stop = true; clearInterval(timer); };
  }, []);

  if (!activity || activity.recent.length === 0) return null;
  const latest = activity.recent[0];

  return (
    <div className="mx-auto mt-4 flex max-w-[820px] items-center justify-center gap-2 text-xs text-muted-foreground sm:text-sm" aria-live="polite">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--sourcing-success))] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--sourcing-success))]" />
      </span>
      <span>
        <strong className="font-semibold text-foreground">{activity.today}</strong> request{activity.today === 1 ? "" : "s"} in the last 24 hours · latest {timeAgo(latest.at)}
      </span>
    </div>
  );
}
