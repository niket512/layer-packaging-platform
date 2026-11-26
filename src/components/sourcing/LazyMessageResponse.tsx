import { lazy, Suspense } from "react";

const Response = lazy(() => import("@/components/ai-elements/message").then(module => ({ default: module.MessageResponse })));

/** The markdown renderer is needed for replies, never for the first form screen. */
export function LazyMessageResponse({ children }: { children: string }) {
  return <Suspense fallback={<span className="whitespace-pre-wrap">{children}</span>}><Response>{children}</Response></Suspense>;
}