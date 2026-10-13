import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { API_CAPABILITIES } from "../../../shared/capabilities";
import type { Workout } from "../../../shared/contracts";
const child: Workout = {
  id: "10000000-0000-4000-8000-000000000001",
  name: "Push routine",
  notes: "",
  createdAt: "2026-10-13T12:00:00Z",
  items: [
    {
      exerciseId: "bench",
      sets: 2,
      reps: 8,
      weight: 45,
      plannedSets: [
        { reps: 12, weight: 20 },
        { reps: 8, weight: 45 },
      ],
    },
  ],
};
const exercise = {
  id: "bench",
  name: "Bench press",
  equipment: "barbell",
  level: "beginner",
  category: "strength",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  instructions: ["Move with control."],
  images: [],
};
let savedBody: unknown;
let fixtureWorkouts: Workout[];
beforeEach(() => {
  savedBody = null;
  fixtureWorkouts = [child];
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = String(input);
      if (url === "/exercises.json") {
        return new Response(JSON.stringify([exercise]));
      }
      if (url.endsWith("/capabilities")) {
        return new Response(JSON.stringify({ data: API_CAPABILITIES }));
      }
      if (url.endsWith("/workouts") && options?.method === "POST") {
        savedBody = JSON.parse(String(options.body));
        return new Response(
          JSON.stringify({
            data: { ...(savedBody as object), id: "10000000-0000-4000-8000-000000000003", createdAt: child.createdAt },
          }),
        );
      }
      return new Response(JSON.stringify({ data: url.endsWith("/workouts") ? fixtureWorkouts : [] }));
    }),
  );
  /** Opens a DOM-only native dialog substitute. */
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  /** Closes a DOM-only native dialog substitute. */
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
/** Connects fixture records through the same visible flow as a real API.
 * @param {ReturnType<typeof userEvent.setup>} user - Interaction driver.
 * @returns {Promise<void>} Connected routine library.
 */
async function connect(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Connect workout API/ }));
  await user.type(screen.getByLabelText("Workout API URL"), "https://example.com/api/v1");
  await user.type(screen.getByLabelText("Private API access token"), "test-private-api-token-more-than-32-characters");
  await user.click(screen.getByRole("button", { name: "Connect API" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await user.click(screen.getByRole("button", { name: /My workouts/ }));
  await user.click(screen.getByRole("button", { name: /Create workout/ }));
}
describe("Nested workout builder", () => {
  it("duplicates a component routine into a new reviewed POST while leaving its source unchanged", async () => {
    const user = userEvent.setup();
    fixtureWorkouts = [
      child,
      {
        ...child,
        id: "10000000-0000-4000-8000-000000000002",
        name: "Combined day",
        items: [],
        includedWorkoutIds: [child.id],
      },
    ];
    render(<App />);
    await connect(user);
    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    const source = screen.getByRole("heading", { name: "Combined day" }).closest("article")!;
    await user.click(within(source).getByRole("button", { name: "Duplicate Combined day" }));
    const builder = screen.getByRole("dialog", { name: "Build your workout" });
    expect(within(builder).getByLabelText("Workout name")).toHaveValue("Copy of Combined day");
    expect(within(builder).getByText(/1\. Push routine/)).toBeInTheDocument();
    expect(savedBody).toBeNull();
    await user.click(within(builder).getByRole("button", { name: "Save workout" }));
    await waitFor(() =>
      expect(savedBody).toEqual({ name: "Copy of Combined day", notes: "", items: [], includedWorkoutIds: [child.id] }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Combined day" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Copy of Combined day" })).toBeInTheDocument();
    expect(child.items[0]?.plannedSets?.[0]?.weight).toBe(20);
  });
  it("keeps nested dependencies available while searching and filtering", async () => {
    const user = userEvent.setup();
    fixtureWorkouts = [
      child,
      {
        ...child,
        id: "10000000-0000-4000-8000-000000000002",
        name: "Combined day",
        items: [],
        includedWorkoutIds: [child.id],
      },
    ];
    render(<App />);
    await connect(user);
    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    await user.selectOptions(screen.getByLabelText("Workout type"), "composed");
    await user.type(screen.getByLabelText("Search workouts"), "BENCH chest");
    expect(screen.getByText("1 of 2 workouts shown")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Push routine" })).not.toBeInTheDocument();
    const parent = screen.getByRole("heading", { name: "Combined day" }).closest("article")!;
    await user.click(within(parent).getByRole("button", { name: "Review Combined day" }));
    const preview = screen.getByRole("dialog", { name: "Review: Combined day" });
    expect(within(preview).getByRole("button", { name: "Bench press" })).toBeInTheDocument();
    await user.click(within(preview).getByRole("button", { name: "Close preview" }));
    await user.clear(screen.getByLabelText("Search workouts"));
    await user.type(screen.getByLabelText("Search workouts"), "no matching routine");
    expect(screen.getByText(/No workouts match this view/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset view" }));
    expect(screen.getByText("2 of 2 workouts shown")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Workout type"), "used");
    expect(screen.getByRole("heading", { name: "Push routine" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Combined day" })).not.toBeInTheDocument();
  });

  it("reviews exact nested targets above the builder, opens a third dialog and preserves the draft", async () => {
    const user = userEvent.setup();
    render(<App />);
    await connect(user);
    const builder = screen.getByRole("dialog", { name: "Build your workout" });
    await user.type(within(builder).getByLabelText("Workout name"), "Preview day");
    await user.selectOptions(within(builder).getByLabelText("Add another workout"), child.id);
    await user.click(within(builder).getByRole("button", { name: "Include workout" }));
    await user.click(within(builder).getByRole("button", { name: "Review full workout" }));
    const preview = screen.getByRole("dialog", { name: "Review: Preview day" });
    expect(screen.getAllByRole("dialog")).toHaveLength(2);
    expect(within(preview).getByText("Push routine")).toBeInTheDocument();
    const rows = within(preview).getAllByRole("row");
    expect(
      within(rows[1]!)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["12", "20"]);
    expect(
      within(rows[2]!)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["8", "45"]);
    await user.click(within(preview).getByRole("button", { name: "Bench press" }));
    expect(screen.getAllByRole("dialog")).toHaveLength(3);
    const detail = screen.getByRole("dialog", { name: "Bench press" });
    await user.click(within(detail).getByRole("button", { name: "Close dialog" }));
    await user.click(within(preview).getByRole("button", { name: "Back to builder" }));
    expect(within(builder).getByLabelText("Workout name")).toHaveValue("Preview day");
    expect(within(builder).getByText(/1\. Push routine/)).toBeInTheDocument();
    expect(savedBody).toBeNull();
    await user.click(within(builder).getByRole("button", { name: "Review full workout" }));
    await user.click(
      within(screen.getByRole("dialog", { name: "Review: Preview day" })).getByRole("button", {
        name: "Start workout",
      }),
    );
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Preview day" })).toBeInTheDocument();
  });
  it("shows invalid draft targets without starting or changing them", async () => {
    const user = userEvent.setup();
    render(<App />);
    await connect(user);
    const builder = screen.getByRole("dialog", { name: "Build your workout" });
    await user.selectOptions(within(builder).getByLabelText("Add another workout"), child.id);
    await user.click(within(builder).getByRole("button", { name: "Copy exercises instead" }));
    await user.clear(within(builder).getByLabelText("Set 1 repetitions"));
    await user.click(within(builder).getByRole("button", { name: "Review full workout" }));
    const preview = screen.getByRole("dialog", { name: "Review: Current draft" });
    expect(within(preview).getByRole("alert")).toHaveTextContent(/>=1/);
    expect(within(preview).getByRole("button", { name: "Start workout" })).toBeDisabled();
    await user.click(within(preview).getByRole("button", { name: "Back to builder" }));
    expect(within(builder).getByLabelText("Set 1 repetitions")).toHaveValue(0);
    expect(savedBody).toBeNull();
  });

  it("saves references without flattening the routine and starts exact component targets", async () => {
    const user = userEvent.setup();
    render(<App />);
    await connect(user);
    const builder = screen.getByRole("dialog", { name: "Build your workout" });
    await user.type(within(builder).getByLabelText("Workout name"), "Combined day");
    await user.selectOptions(within(builder).getByLabelText("Add another workout"), child.id);
    await user.click(within(builder).getByRole("button", { name: "Include workout" }));
    expect(within(builder).getByText(/1\. Push routine/)).toBeInTheDocument();
    await user.click(within(builder).getByText(/Add exercises from the library/));
    expect(within(builder).getByText("No more matching exercises.")).toBeInTheDocument();
    await user.click(within(builder).getByRole("button", { name: "Save workout" }));
    await waitFor(() =>
      expect(savedBody).toEqual({ name: "Combined day", notes: "", items: [], includedWorkoutIds: [child.id] }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    const card = screen.getByRole("heading", { name: "Combined day" }).closest("article")!;
    const childCard = screen.getByRole("heading", { name: "Push routine" }).closest("article")!;
    const deletion = within(childCard).getByRole("button", { name: "Delete Push routine" });
    expect(deletion).toBeDisabled();
    expect(deletion).toHaveAccessibleDescription(/Used by 1 parent workout.*Combined day/);
    await user.click(within(childCard).getByRole("button", { name: "Review Push routine" }));
    const childPreview = screen.getByRole("dialog", { name: "Review: Push routine" });
    await user.click(within(childPreview).getByRole("button", { name: "Review parent Combined day" }));
    const parentPreview = screen.getByRole("dialog", { name: "Review: Combined day" });
    expect(within(parentPreview).getByText("Push routine")).toBeInTheDocument();
    await user.click(within(parentPreview).getByRole("button", { name: "Close preview" }));
    await user.click(within(childCard).getByRole("button", { name: "Edit Push routine" }));
    const componentBuilder = screen.getByRole("dialog", { name: "Make this workout yours" });
    await user.click(within(componentBuilder).getByRole("button", { name: "Review full workout" }));
    const componentPreview = screen.getByRole("dialog", { name: "Review: Push routine" });
    expect(within(componentPreview).getByRole("button", { name: "Review parent Combined day" })).toBeInTheDocument();
    await user.click(within(componentPreview).getByRole("button", { name: "Back to builder" }));
    expect(within(componentBuilder).getByLabelText("Workout name")).toHaveValue("Push routine");
    await user.click(within(componentBuilder).getByRole("button", { name: "Close dialog" }));
    expect(within(card).queryByText(/2 movements/)).not.toBeInTheDocument();
    expect(within(card).getByText(/1 movement · 2 sets/)).toBeInTheDocument();
    await user.click(within(card).getByRole("button", { name: /Start workout/ }));
    const session = screen.getByRole("dialog");
    const inputs = within(session).getAllByRole("spinbutton");
    expect(inputs.some((input) => (input as HTMLInputElement).value === "20")).toBe(true);
    expect(inputs.some((input) => (input as HTMLInputElement).value === "45")).toBe(true);
  });
  it("keeps copied exercises independent and permits reviewing a referenced movement above the builder", async () => {
    const user = userEvent.setup();
    render(<App />);
    await connect(user);
    const builder = screen.getByRole("dialog", { name: "Build your workout" });
    await user.selectOptions(within(builder).getByLabelText("Add another workout"), child.id);
    await user.click(within(builder).getByRole("button", { name: "Include workout" }));
    await user.click(within(builder).getByText(/1\. Push routine/));
    await user.click(within(builder).getByRole("button", { name: "Bench press" }));
    const detail = screen.getByRole("dialog", { name: "Bench press" });
    expect(within(detail).getByRole("button", { name: "Added to workout" })).toBeDisabled();
    await user.click(within(detail).getByRole("button", { name: "Close dialog" }));
    await user.click(within(builder).getByRole("button", { name: "Remove component" }));
    await user.selectOptions(within(builder).getByLabelText("Add another workout"), child.id);
    await user.click(within(builder).getByRole("button", { name: "Copy exercises instead" }));
    expect(within(builder).getByLabelText("Set 1 weight")).toHaveValue(20);
    expect(within(builder).getByLabelText("Set 2 weight")).toHaveValue(45);
    expect(within(builder).queryByRole("button", { name: "Remove component" })).not.toBeInTheDocument();
  });
});
