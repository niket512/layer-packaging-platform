import { useState } from "react";
import { PRODUCT_CATEGORIES } from "@/lib/box-enquiry";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

/** Keyboard-accessible type-ahead, loaded only for the desktop project-details step. */
export default function ProductPicker({ onChoose }: { onChoose: (value: string, custom: boolean) => void }) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const suggestions = q ? PRODUCT_CATEGORIES.filter(p => p !== "Other" && p.toLowerCase().includes(q)).slice(0, 6) : [];
  const exact = PRODUCT_CATEGORIES.some(p => p.toLowerCase() === q);
  return <Command shouldFilter={false} className="relative overflow-visible rounded-lg border border-border bg-card [&_[cmdk-input-wrapper]]:border-0">
    <CommandInput aria-label="Type your product" value={search} onValueChange={setSearch} onKeyDown={event => { if (event.key === "Escape") setSearch(""); }} placeholder="Start typing, e.g. skincare, candles" className="text-base" />
    {q && <CommandList className="absolute inset-x-0 top-full z-20 mt-1 rounded-lg border border-border bg-card py-1 shadow-lg">
      {suggestions.map(p => <CommandItem key={p} value={p} onSelect={() => onChoose(p, false)} className="min-h-11 px-3 text-sm">{p}</CommandItem>)}
      {!exact && <CommandItem value={`custom-${q}`} onSelect={() => onChoose(search.trim().slice(0, 60), true)} className="min-h-11 px-3 text-sm text-primary">Add “{search.trim()}”</CommandItem>}
    </CommandList>}
  </Command>;
}