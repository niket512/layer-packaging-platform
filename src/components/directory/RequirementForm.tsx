import { useState } from "react";
import { ImagePlus, Loader2, X, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { imageFileToDataUrl } from "@/lib/image-data-url";
import { type DirectoryManufacturer, waDigits } from "@/data/directory";

const GROUP_URL = "https://chat.whatsapp.com/I0vypMLz6bEKIeViw8rwh6";
const field = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function RequirementForm({ manufacturers }: { manufacturers: DirectoryManufacturer[] }) {
  const [contact, setContact] = useState("");
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const chosen = manufacturers.filter((m) => selected.includes(m.id));

  const addImages = async (files: FileList | null) => {
    if (!files) return;
    try {
      const urls = await Promise.all(Array.from(files).slice(0, 4 - images.length).map((f) => imageFileToDataUrl(f, 900)));
      setImages((p) => [...p, ...urls].slice(0, 4));
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contact.trim().length < 3 || text.trim().length < 5) return setMsg({ ok: false, text: "Add your contact and a short requirement." });
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("requirement_submissions").insert({ contact: contact.trim(), requirement: text.trim(), images, manufacturers: chosen.map((m) => m.name) });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: "Couldn't send. Please try again." });
    setMsg({ ok: true, text: "Thanks! We've received your requirement and will match suppliers." });
  };

  const directText = `Hi, I found you on Snaplogo. My packaging requirement: ${text.trim() || "(details)"}`;
  const withPhone = manufacturers.filter((m) => m.phone);

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="space-y-3">
        <input className={field} placeholder="Your phone or email" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={200} />
        <textarea className={`${field} min-h-[96px]`} placeholder="Describe what you need — pack type, size, quantity, printing, location…" value={text} onChange={(e) => setText(e.target.value)} maxLength={4000} />
        <div>
          <p className="text-xs font-medium text-muted-foreground">Select manufacturers to contact (optional)</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {manufacturers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${selected.includes(m.id) ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground hover:border-primary/60"}`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
              <img src={src} alt={`Reference ${i + 1}`} className="h-full w-full object-cover" />
              <button type="button" aria-label="Remove image" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="absolute right-0.5 top-0.5 rounded-full bg-background/80 p-0.5"><X className="h-3 w-3" /></button>
            </div>
          ))}
          {images.length < 4 && (
            <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-input text-[10px] text-muted-foreground hover:border-primary">
              <ImagePlus className="h-4 w-4" />Add photo
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addImages(e.target.files); e.target.value = ""; }} />
            </label>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={busy} className="rounded-full">{busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Submit requirement</Button>
          <a href={GROUP_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline-offset-4 hover:underline">or join our WhatsApp group</a>
        </div>
        {msg && <p className={`text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>}
      </form>

      {withPhone.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium">WhatsApp {selected.length > 0 ? "your selected manufacturers" : "a manufacturer directly"}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Opens WhatsApp with your requirement filled in. Attach your photos in the chat.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(selected.length > 0 ? chosen.filter((m) => m.phone) : withPhone).map((m) => (
              <Button key={m.id} asChild variant="outline" size="sm" className="rounded-full">
                <a href={`https://wa.me/${waDigits(m.phone!)}?text=${encodeURIComponent(directText)}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1 h-3.5 w-3.5" />{m.name}</a>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
