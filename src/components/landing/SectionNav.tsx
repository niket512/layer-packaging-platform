import { useEffect, useState } from "react";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { cn } from "@/lib/utils";

const items = [
  { id: "capabilities", label: "How It Helps" },
  { id: "how-it-works", label: "How It Works" },
  { id: "what-we-offer", label: "What We Offer" },
  { id: "platform", label: "Dashboard" },
  { id: "why-snaplogo", label: "Compare" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQs" },
];

export default function SectionNav() {
  const [show, setShow] = useState(false);
  const active = useScrollSpy(items.map((i) => i.id), 140);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={cn(
        "sticky top-16 z-40 h-12 border-b border-border bg-background transition-opacity duration-200",
        show ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <nav className="mx-auto h-full max-w-content overflow-x-auto px-[5vw] md:px-8">
        <ul className="flex h-full items-center justify-start gap-6 whitespace-nowrap md:justify-center md:gap-8">
          {items.map((it) => {
            const isActive = active === it.id;
            return (
              <li key={it.id} className="flex h-full items-center">
                <a
                  href={`#${it.id}`}
                  onClick={(e) => onClick(e, it.id)}
                  className={cn(
                    "flex h-full items-center border-b-2 text-[13px] font-medium transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-primary",
                  )}
                >
                  {it.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
