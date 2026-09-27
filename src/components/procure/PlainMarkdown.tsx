// Minimal renderer for AI markdown: headings/bold lines and bullets
export default function PlainMarkdown({ text }: { text: string }) {
  const bold = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>,
    );
  return (
    <div className="space-y-1.5 text-[13px] leading-relaxed text-foreground">
      {text.split("\n").filter((l) => l.trim()).map((l, i) => {
        const t = l.trim().replace(/^#+\s*/, "");
        if (/^[-*•]\s/.test(t)) return <p key={i} className="pl-4 -indent-3">• {bold(t.replace(/^[-*•]\s/, ""))}</p>;
        return <p key={i}>{bold(t)}</p>;
      })}
    </div>
  );
}
