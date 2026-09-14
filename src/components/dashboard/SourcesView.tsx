import { FileText } from "lucide-react";
import { references, sources } from "@/lib/catalogue";

export default function SourcesView() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-xl font-semibold text-foreground">Source catalogues</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Every listing traces back to a supplier catalogue page
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {sources.map((s) => (
            <div key={s.key} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-heading text-[14px] font-semibold text-foreground">{s.name}</p>
                  <p className="text-[12px] text-muted-foreground">{s.manufacturer}</p>
                  <p className="mt-2 text-[12px] text-muted-foreground">
                    {s.pages} pages · {s.groups} catalogue groups
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-xl font-semibold text-foreground">Visual references</h2>
        <div className="mt-4 space-y-3">
          {references.map((r) => (
            <div key={r.name} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-heading text-[14px] font-semibold text-foreground">{r.name}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">{r.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
