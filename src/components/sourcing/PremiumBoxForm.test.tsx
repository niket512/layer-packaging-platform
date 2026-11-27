// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { BOX_TYPES } from "@/lib/box-enquiry";
import { PremiumBoxForm } from "./PremiumBoxForm";

vi.mock("@tanstack/react-router", () => ({ useHydrated: () => true }));
vi.mock("@/lib/router-compat", () => ({ useNavigate: () => vi.fn() }));
vi.mock("@/lib/chat-monitoring", () => ({ syncSourcingChat: vi.fn() }));
vi.mock("@/lib/visitor-tracking", () => ({ flushVisitorTracking: vi.fn(), trackFormField: vi.fn(), trackFunnel: vi.fn(), trackJourney: vi.fn() }));

const boxButton = (label: string) => screen.getByRole("button", { name: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
const draft = () => JSON.parse(localStorage.getItem("snaplogo.form.v2.draft") ?? "{}");

beforeEach(() => { HTMLElement.prototype.scrollIntoView = vi.fn(); });
afterEach(() => { cleanup(); localStorage.clear(); });

it.each(BOX_TYPES)("selecting $id keeps step 1 open and marks the box selected", async ({ id, label }) => {
  render(<PremiumBoxForm onActive={vi.fn()} />);
  await act(async () => { fireEvent.click(boxButton(label)); });
  expect(screen.queryByLabelText(/Quantity/)).toBeNull();
  expect(boxButton(label).getAttribute("aria-pressed")).toBe("true");
  expect(draft().step).toBe(0);
  expect(draft().e.boxTypes).toEqual([id]);
});

it.each(BOX_TYPES)("Continue on step 1 moves to step 2 with the selected box", async ({ id, label }) => {
  render(<PremiumBoxForm onActive={vi.fn()} />);
  await act(async () => { fireEvent.click(boxButton(label)); });
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Continue/ })); });
  expect(screen.getByLabelText(/Quantity/)).toBeTruthy();
  expect(draft().step).toBe(1);
  expect(draft().e.boxTypes).toEqual([id]);
  fireEvent.click(screen.getByRole("button", { name: /Back/ }));
  expect(boxButton(label).getAttribute("aria-pressed")).toBe("true");
});

it("Continue on step 1 asks for a box type when none is selected", async () => {
  render(<PremiumBoxForm onActive={vi.fn()} />);
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Continue/ })); });
  expect(screen.getByRole("alert")).toBeTruthy();
  expect(screen.queryByLabelText(/Quantity/)).toBeNull();
});

it("step 2 no longer asks what goes inside the box", async () => {
  render(<PremiumBoxForm onActive={vi.fn()} />);
  await act(async () => { fireEvent.click(boxButton("Mailer box")); });
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Continue/ })); });
  expect(screen.queryByText(/What product will go inside/)).toBeNull();
  expect(screen.getByLabelText(/Quantity/)).toBeTruthy();
});

it("step 2 combines project details and WhatsApp contact with the submit button", async () => {
  render(<PremiumBoxForm onActive={vi.fn()} />);
  await act(async () => { fireEvent.click(boxButton("Mailer box")); });
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Continue/ })); });
  expect(screen.getByLabelText(/Quantity/)).toBeTruthy();
  expect(screen.getByLabelText(/WhatsApp number/)).toBeTruthy();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByRole("button", { name: /Get My Free Quotes/ })).toBeTruthy();
});
