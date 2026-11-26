import { cn } from "@/lib/utils";

/** Snaplogo wordmark logo. Use `dark` when it sits on a dark background. */
export function Logo({ dark = false, className }: { dark?: boolean; className?: string }) {
  return <img src={dark ? "/snaplogo-logo-dark.svg" : "/snaplogo-logo.svg"} alt="Snaplogo" width={289} height={60} className={cn("h-7 w-auto md:h-8", className)} />;
}
