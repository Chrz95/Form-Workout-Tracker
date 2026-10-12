import { Demonstration } from "../features/exercises/Demonstration";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { exerciseSchema } from "../../../shared/contracts";
const exercise = exerciseSchema.parse({
  id: "Pushups",
  name: "Pushups",
  level: "beginner",
  equipment: "body only",
  primaryMuscles: ["chest"],
  secondaryMuscles: ["triceps"],
  instructions: ["Lower your body with control.", "Press back up."],
  category: "strength",
  mechanic: "compound",
  images: ["/exercises/Pushups/0.webp", "/exercises/Pushups/1.webp"],
});
const squat = {
  ...exercise,
  id: "Barbell_Squat",
  name: "Barbell Squat",
  equipment: "barbell",
  primaryMuscles: ["quadriceps"],
};
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify([exercise, squat]))),
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: true })),
  );
  /** Mimics native dialog opening in the DOM-only test environment. */
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  /** Mimics native dialog closure in the DOM-only test environment. */
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("Exercise discovery and draft behavior", () => {
  it("filters exercises by search and equipment", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Pushups" });
    await user.type(screen.getByRole("textbox", { name: "Search exercises" }), "squat");
    expect(screen.queryByRole("button", { name: "Pushups" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Barbell Squat" })).toBeInTheDocument();
    await user.clear(screen.getByRole("textbox", { name: "Search exercises" }));
    await user.selectOptions(screen.getByLabelText("Filter equipment"), "body only");
    expect(screen.queryByRole("button", { name: "Barbell Squat" })).not.toBeInTheDocument();
  });
  it("opens exercise instructions with a controllable demonstration", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Pushups" }));
    expect(screen.getByText("Lower your body with control.")).toBeInTheDocument();
    expect(screen.getByText(/2-frame demonstration/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Next frame/ }));
    expect(screen.getByAltText("Pushups, demonstration position 2")).toBeInTheDocument();
  });
  it("avoids duplicate draft items and preserves drafts after failed saves", async () => {
    const user = userEvent.setup();
    render(<App />);
    const add = await screen.findByRole("button", { name: "Add Pushups to workout" });
    await user.click(add);
    expect(add).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /Review workout/ }));
    await user.type(screen.getByRole("textbox", { name: "Workout name" }), "My push day");
    await user.click(screen.getByRole("button", { name: "Save workout" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Connect your workout API"));
    expect(screen.getByRole("textbox", { name: "Workout name" })).toHaveValue("My push day");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
  it("shows honest empty progress without fabricated sessions", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Your progress" }));
    expect(screen.getByText("Log your first session to start building your story.")).toBeInTheDocument();
    expect(screen.getByText("Sessions completed")).toBeInTheDocument();
  });
  it("offers text guidance for exercises without source photographs", () => {
    render(<Demonstration exercise={{ ...exercise, images: [] }} />);
    expect(screen.getByText(/Photographs are unavailable/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Next frame/ })).not.toBeInTheDocument();
  });
});

describe("Live workout entry points", () => {
  it("starts a builder draft, preserves a minimized session and retains failed completion", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Add Pushups to workout" }));
    await user.click(screen.getByRole("button", { name: /Review workout/ }));
    await user.type(screen.getByRole("textbox", { name: "Workout name" }), "Live push day");
    await user.click(screen.getByRole("button", { name: "Start workout" }));
    expect(screen.getByRole("heading", { name: "Live push day" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Complete set 1" }));
    expect(screen.getByText("1 / 3 sets completed")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Minimize" }));
    await user.click(screen.getByRole("button", { name: /Resume workout/ }));
    expect(screen.getByRole("button", { name: "Undo set 1" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Finish workout" }));
    expect(screen.getByRole("heading", { name: "Finish with intention." })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save completed workout" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Connect your workout API"));
    expect(screen.getByRole("textbox", { name: "Session name" })).toHaveValue("Live push day");
    expect(screen.queryByText("Your effort, recorded.")).not.toBeInTheDocument();
  });
});
