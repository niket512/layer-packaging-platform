import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { renderWithRouter } from "@/test/render-with-router";
import SourcingThankYou from "./SourcingThankYou";
import { markConversionPending } from "@/lib/sourcing-conversion";

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn().mockResolvedValue({ data: { ok: true } }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke } } }));
vi.mock("@/components/sourcing/SourcingBrief", () => ({ SourcingBrief: () => null }));

afterEach(() => { cleanup(); localStorage.clear(); vi.clearAllMocks(); });
describe("thank-you conversion lifecycle", () => {
  it("clears the displayed confirmation and sends Google, Reddit Pixel and server Lead only once", async () => {
    const gtag = vi.fn(); const rdt = vi.fn();
    Object.assign(window, { gtag, rdt, dataLayer: [] });
    localStorage.setItem("snaplogo.sourcing.thankyou", JSON.stringify({ leadId: "saved-enquiry-test", submissionId: "00000000-0000-4000-8000-000000000001", phone: "", brief: [] }));
    markConversionPending("saved-enquiry-test");
    const view = await renderWithRouter(<SourcingThankYou />, "/sourcing/thank-you");
    expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
    expect(localStorage.getItem("snaplogo.sourcing.thankyou")).toBeNull();
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", "page_view", { page_path: "/sourcing/thank-you" });
    expect(rdt).toHaveBeenCalledWith("track", "Lead", { conversionId: "saved-enquiry-test" });
    expect(rdt).toHaveBeenCalledWith("track", "PageVisit");
    expect(invoke).toHaveBeenCalledTimes(1);
    view.unmount();
    await renderWithRouter(<SourcingThankYou />, "/sourcing/thank-you");
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(rdt).toHaveBeenCalledTimes(2);
    expect(invoke).toHaveBeenCalledTimes(1);
  });
  it("sends a new sourcing request back to the homepage", async () => {
    await renderWithRouter(<SourcingThankYou />, "/sourcing/thank-you");
    expect(screen.getByRole("link", { name: /new sourcing request/i }).getAttribute("href")).toBe("/");
  });
  it("offers the WhatsApp community invite with the saved group link", async () => {
    await renderWithRouter(<SourcingThankYou />, "/sourcing/thank-you");
    const invite = screen.getByRole("link", { name: /brands and manufacturers group/i });
    expect(invite.getAttribute("href")).toBe("https://chat.whatsapp.com/I0vypMLz6bEKIeViw8rwh6");
    expect(invite.getAttribute("target")).toBe("_blank");
  });
  it("does not count a direct thank-you visit", async () => {
    const gtag = vi.fn(); const rdt = vi.fn(); Object.assign(window, { gtag, rdt });
    await renderWithRouter(<SourcingThankYou />, "/sourcing/thank-you");
    expect(gtag).not.toHaveBeenCalled();
    expect(rdt).not.toHaveBeenCalled();
    expect(invoke).not.toHaveBeenCalled();
  });
});