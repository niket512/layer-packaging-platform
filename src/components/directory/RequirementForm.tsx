import { useState } from "react";
import { ImagePlus, Loader2, X, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { imageFileToDataUrl } from "@/lib/image-data-url";
import { type DirectoryManufacturer, waDigits } from "@/data/directory";

const GROUP_URL = "https://chat.whatsapp.com/I0vypMLz6bEKIeViw8rwh6";
const field = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface Props {
  manufacturers: DirectoryManufacturer[];
  selected: string[];
  onToggle: (id: string) => void;
  contact: string;
  onContact: (v: string) => void;
  text: string;
  onText: (v: string) => void;
  images: string[];
  onImages: (v: string[]) => void;
}

export function RequirementForm({ manufacturers, selected, onToggle, contact, onContact, text, onText, images, onImages }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const chosen = manufacturers.filter((m) => selected.includes(m.id));

  const addImages = async (files: FileList | null) => {
    if (!files) return;
    try {
      const urls = await Promise.all(Array.from(files).slice(0, 4 - images.length).map((f) => imageFileToDataUrl(f, 900)));
      onImages([...images, ...urls].slice(0, 4));
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
  const waTargets = chosen.filter((m) => m.phone);

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-muted/40 p-4 md:p-5">
      <p className="text-xs font-semibold uppercase tracking-[1.5px] text-primary">Share your requirement</p>
      <textarea
        className={`${field} mt-2 min-h-[72px]`}
        placeholder="What do you need? e.g. 10,000 printed kraft paper bags, 12x10x4 in, delivered in Delhi…"
        value={text}
        onChange={(e) => onText(e.target.value)}
        maxLength={4000}
        aria-label="Your packaging requirement"
      />
      <div className="mt-3 flex flex-wrap items-start gap-3">
        <input className={`${field} h-10 max-w-xs flex-1`} placeholder="Your phone or email" value={contact} onChange={(e) => onContact(e.target.value)} maxLength={200} aria-label="Your phone or email" />
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative h-10 w-10 overflow-hidden rounded-lg border border-border">
              <img src={src} alt={`Reference ${i + 1}`} className="h-full w-full object-cover" />
              <button type="button" aria-label="Remove image" onClick={() => onImages(images.filter((_, j) => j !== i))} className="absolute right-0 top-0 rounded-full bg-background/80 p-0.5"><X className="h-3 w-3" /></button>
            </div>
          ))}
          {images.length < 4 && (
            <label className="flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-input px-3 text-xs text-muted-foreground hover:border-primary">
              <ImagePlus className="h-4 w-4" />{images.length ? `Add (${images.length}/4)` : "Add photos"}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addImages(e.target.files); e.target.value = ""; }} />
            </label>
          )}
        </div>
      </div>

      {chosen.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground">Selected manufacturers</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {chosen.map((m) => (
              <button key={m.id} type="button" onClick={() => onToggle(m.id)} className="rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {m.name}<X className="ml-1 inline h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy} className="rounded-full">{busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Submit requirement</Button>
        {waTargets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {waTargets.map((m) => (
              <Button key={m.id} asChild variant="outline" size="sm" className="rounded-full">
                <a href={`https://wa.me/${waDigits(m.phone!)}?text=${encodeURIComponent(directText)}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1 h-3.5 w-3.5" />WhatsApp {m.name}</a>
              </Button>
            ))}
          </div>
        )}
        <a href={GROUP_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline-offset-4 hover:underline">or post it in our WhatsApp group</a>
      </div>
      {msg && <p className={`mt-2 text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>}
      {chosen.length === 0 && <p className="mt-2 text-xs text-muted-foreground">Tip: tick “Select” on manufacturers below, then WhatsApp them your requirement with one tap.</p>}
    </form>
  );
}
