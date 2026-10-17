import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../../app/App";
import { API_CAPABILITIES } from "../../../../../shared/capabilities";
import { AnimationGuide } from "../AnimationGuide";
const exercise = {
  id: "Pushups",
  name: "Pushups",
  equipment: "body only",
  level: "beginner",
  category: "strength",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  instructions: ["Move with control."],
  images: [],
};
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = String(input);
      if (url === "/exercise-references.json") {
        return new Response(JSON.stringify([]));
      }
      if (url === "/exercises.json") {
        return new Response(JSON.stringify([exercise]));
      }
      if (url.endsWith("/capabilities")) {
        return new Response(JSON.stringify({ data: API_CAPABILITIES }));
      }
      if (options?.method === "POST") {
        throw new Error("Connection lost before confirmation");
      }
      return new Response(JSON.stringify({ data: [] }));
    }),
  );
  /** Mimics native dialog opening for DOM interaction verification. */
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  /** Mimics native dialog closure for DOM interaction verification. */
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("Private custom exercise editor", () => {
  it("allows an authored draft while clearly disabling persistence before connection", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Create an exercise" }));
    await user.type(screen.getByRole("textbox", { name: "Exercise name" }), "My movement");
    expect(screen.getByRole("button", { name: "Save exercise" })).toBeDisabled();
    expect(screen.getByText(/Connect an API with the custom exercise update/)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Exercise name" })).toHaveValue("My movement");
  });
  it("keeps authored instructions and fields intact after an unconfirmed API save", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Connect training/ }));
    await user.type(screen.getByRole("textbox", { name: "Workout API URL" }), "https://example.com/api/v1");
    await user.type(screen.getByLabelText("Private API access token"), "private-test-token-with-over-32-characters");
    await user.click(screen.getByRole("button", { name: "Connect API" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Create an exercise" }));
    await user.type(screen.getByRole("textbox", { name: "Exercise name" }), "My movement");
    await user.type(screen.getByRole("textbox", { name: /Primary muscles/ }), "chest");
    await user.type(screen.getByRole("textbox", { name: /Instructions/ }), "Set up.\nMove with control.");
    await user.click(screen.getByRole("button", { name: "Save exercise" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("unreachable"));
    expect(screen.getByRole("textbox", { name: "Exercise name" })).toHaveValue("My movement");
    expect(screen.getByRole("textbox", { name: /Instructions/ })).toHaveValue("Set up.\nMove with control.");
    expect(screen.queryByText("Your custom exercise is saved and ready to use.")).not.toBeInTheDocument();
  });
  it("keeps real animation still until requested and restores the poster when motion stops", async () => {
    const user = userEvent.setup();
    render(
      <AnimationGuide
        name="My exercise"
        asset={{
          url: "/animated.webp",
          stillUrl: "/still.webp",
          frameCount: 30,
          sourceUrl: "https://wger.de/original",
          author: "Source creator",
          license: "CC-BY-SA 4",
          licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
        }}
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute("src", "/still.webp");
    await user.click(screen.getByRole("button", { name: "Play animation" }));
    expect(screen.getByRole("img")).toHaveAttribute("src", "/animated.webp");
    await user.click(screen.getByRole("button", { name: "Stop motion" }));
    expect(screen.getByRole("img")).toHaveAttribute("src", "/still.webp");
  });
});
