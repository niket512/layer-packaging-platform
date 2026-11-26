import { useEffect, useRef, useState, type ReactNode } from "react";

/** Mount optional catalogue/map code only as the reader approaches it. */
export function DeferredSection({ children, className }: { children: ReactNode; className: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "400px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={host} className={visible ? undefined : className}>{visible ? children : null}</div>;
}