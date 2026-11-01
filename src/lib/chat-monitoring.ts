import { supabase } from "@/integrations/supabase/client";
import { sourcingProjectTitle, type SourcingProject } from "./sourcing";

export function chatSnapshot(project: SourcingProject) {
  return {
    title: sourcingProjectTitle(project).slice(0, 200),
    transcript: project.turns.slice(-200).map(({ matches: _matches, ...turn }) => turn),
    brief: project.brief ?? [],
    status: project.submitted ? "submitted" : "ongoing",
    contact: project.phone ?? null,
    submission_id: project.submissionId ?? null,
  };
}

// Each random capability authorizes writes only; it never allows reading a chat.
export async function syncSourcingChat(project: SourcingProject) {
  if (!project.turns.length) return;
  const key = `snaplogo.chat.write.${project.id}`;
  let token: string;
  try {
    token = localStorage.getItem(key) ?? crypto.randomUUID();
    localStorage.setItem(key, token);
  } catch { return; }
  const { error } = await supabase.rpc("save_sourcing_chat", {
    _id: project.id, _token: token, _snapshot: JSON.parse(JSON.stringify(chatSnapshot(project))), _revision: Date.now(),
  });
  if (error) throw new Error("Chat sync unavailable");
}