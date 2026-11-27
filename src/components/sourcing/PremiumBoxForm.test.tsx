// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { BOX_TYPES } from "@/lib/box-enquiry";
import { PremiumBoxForm } from "./PremiumBoxForm";

vi.mock("@tanstack/react-router", () => ({ useHydrated: () => true }));
vi.mock("@/lib/router-compat", () => ({ useNavigate: () => vi.fn() }));
vi.mock("@/lib/chat-monitoring", () => ({ syncSourcingChat: vi.fn() }));
vi.mock("@/lib/visitor-tracking", () => ({ flushVisitorTracking: vi.fn(), trackFormField: vi.fn(), trackFunnel: vi.fn(), trackJourney: vi.fn() }));
vi.mock("./ProductPicker", () => ({ default: () => null }));

beforeEach(() => { HTMLElement.prototype.scrollIntoView = vi.fn(); });
afterEach(() => { cleanup(); localStorage.clear(); });

it.each(BOX_TYPES)("selecting $id advances directly to step 2 and preserves the selected box", async ({ id, label }) => {
  render(<PremiumBoxForm onActive={vi.fn()} />);
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) })); });
  expect(screen.getByLabelText(/Quantity/)).toBeTruthy();
  const draft = JSON.parse(localStorage.getItem("snaplogo.form.v2.draft") ?? "{}");
  expect(draft.step).toBe(1);
  expect(draft.e.boxTypes).toEqual([id]);
  fireEvent.click(screen.getByRole("button", { name: /Back/ }));
  expect(screen.getByRole("button", { name: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).getAttribute("aria-pressed")).toBe("true");
});