// @vitest-environment jsdom
import { cleanup, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DeferredSection } from "./DeferredSection";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("optional homepage loading", () => {
  it("keeps the optional section unmounted until it approaches the viewport", () => {
    let notify: IntersectionObserverCallback | undefined;
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe = observe;
      disconnect = disconnect;
    });
    render(<DeferredSection className="min-h-80"><div>Catalogue data</div></DeferredSection>);
    expect(screen.queryByText("Catalogue data")).toBeNull();
    expect(observe).toHaveBeenCalledTimes(1);
    act(() => notify?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(screen.getByText("Catalogue data")).toBeTruthy();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("still exposes the section in browsers without intersection observers", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    // Older browsers do not have the property, rather than an undefined constructor.
    delete (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
    render(<DeferredSection className="min-h-80"><div>Catalogue data</div></DeferredSection>);
    expect(screen.getByText("Catalogue data")).toBeTruthy();
  });
});