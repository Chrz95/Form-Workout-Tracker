import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Exercise } from "../../../../shared/contracts";
import type { Studio } from "../../app/useStudio";
import { ExercisePicker } from "./ExercisePicker";
import { WORKOUT_DEFAULTS } from "../../../../shared/constants";
const press: Exercise = {
  id: "press",
  name: "Incline Dumbbell Bench Press",
  level: "beginner",
  equipment: "dumbbell",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  category: "strength",
  instructions: [],
  images: ["/press.webp"],
  aliases: ["Inclined DB press"],
};
/** Creates the narrow picker model without mocking its paging or selection logic.
 * @param {Exercise[]} exercises - Test catalog.
 * @returns {Studio} Model with tracked review and add actions.
 */
function model(exercises: Exercise[]): Studio {
  return {
    exercises,
    draftSelectedItems: [],
    muscleOptions: ["All muscles", "chest", "back", "biceps"],
    equipmentOptions: ["All equipment", "dumbbell", "barbell", "No equipment"],
    addExercise: vi.fn(),
    setSelectedExercise: vi.fn(),
    catalogError: "",
  } as unknown as Studio;
}
beforeEach(() => {
  /** Mimics native modal presentation in DOM-only interaction tests. */
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  /** Mimics native closure without changing the picker model. */
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("Workout exercise picker", () => {
  it("loads successive pages from an observer rooted in the picker, then resets on search", async () => {
    let notify: IntersectionObserverCallback | undefined;
    let options: IntersectionObserverInit | undefined;
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn(function (callback: IntersectionObserverCallback, configuration: IntersectionObserverInit) {
        notify = callback;
        options = configuration;
        return { observe: vi.fn(), disconnect };
      }),
    );
    const exercises = Array.from({ length: 29 }, (_, index) => ({ ...press, id: `p${index}`, name: `Press ${index}` }));
    render(<ExercisePicker studio={model(exercises)} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Add exercises" }));
    await waitFor(() => expect(notify).toBeDefined());
    const results = screen.getByRole("region", { name: "Available exercises" });
    expect(options?.root).toBe(results);
    expect(within(results).getAllByRole("listitem")).toHaveLength(WORKOUT_DEFAULTS.pageSize);
    act(() => notify!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(within(results).getAllByRole("listitem")).toHaveLength(24);
    act(() => notify!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(within(results).getAllByRole("listitem")).toHaveLength(29);
    expect(screen.queryByRole("button", { name: "Load more exercises" })).not.toBeInTheDocument();
    results.scrollTop = 300;
    await user.type(screen.getByLabelText("Search exercises to add"), "Press");
    expect(within(results).getAllByRole("listitem")).toHaveLength(12);
    expect(results.scrollTop).toBe(0);
    cleanup();
    expect(disconnect).toHaveBeenCalled();
  });
  it("supports scroll paging and a manual fallback without IntersectionObserver", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const exercises = Array.from({ length: 28 }, (_, i) => ({ ...press, id: `p${i}` }));
    render(<ExercisePicker studio={model(exercises)} />);
    await userEvent.click(screen.getByRole("button", { name: "Add exercises" }));
    const results = screen.getByRole("region", { name: "Available exercises" });
    Object.defineProperties(results, { scrollHeight: { value: 600 }, clientHeight: { value: 300 } });
    fireEvent.scroll(results, { target: { scrollTop: 280 } });
    expect(within(results).getAllByRole("listitem")).toHaveLength(24);
    await userEvent.click(screen.getByRole("button", { name: "Load more exercises" }));
    expect(within(results).getAllByRole("listitem")).toHaveLength(28);
  });
  it("combines unordered search with muscle, equipment and level and clears them independently", async () => {
    const row = { ...press, id: "row", name: "Dumbbell Row", aliases: [], primaryMuscles: ["lats"], level: "expert" };
    render(<ExercisePicker studio={model([press, row])} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Add exercises" }));
    await user.type(screen.getByLabelText("Search exercises to add"), "PRESS dumbbell incline");
    expect(screen.getByRole("button", { name: `View ${press.name}` })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "View Dumbbell Row" })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Muscle"), "chest");
    await user.selectOptions(screen.getByLabelText("Equipment"), "dumbbell");
    await user.selectOptions(screen.getByLabelText("Level"), "expert");
    expect(screen.getByText(/No more matching exercises/)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Level"), "beginner");
    expect(screen.getByRole("button", { name: `View ${press.name}` })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear exercise filters" }));
    await user.selectOptions(screen.getByLabelText("Muscle"), "back");
    expect(screen.getByRole("button", { name: "View Dumbbell Row" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: `View ${press.name}` })).not.toBeInTheDocument();
  });
  it("shows lazy thumbnails, opens review separately and excludes selected aliases and archived entries", async () => {
    const studio = model([
      press,
      { ...press, id: "selected", legacyIds: ["old"] },
      { ...press, id: "archived", isArchived: true },
    ]);
    studio.draftSelectedItems = [{ exerciseId: "old", sets: 3, reps: 10, weight: 0 }];
    const { rerender } = render(<ExercisePicker studio={studio} />);
    await userEvent.click(screen.getByRole("button", { name: "Add exercises" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/press.webp");
    expect(screen.getByRole("img")).toHaveAttribute("loading", "lazy");
    await userEvent.click(screen.getByRole("button", { name: `View ${press.name}` }));
    expect(studio.setSelectedExercise).toHaveBeenCalledWith(press);
    expect(studio.addExercise).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: `Add ${press.name} to workout` }));
    expect(studio.addExercise).toHaveBeenCalledWith(press.id);
    rerender(
      <ExercisePicker
        studio={{
          ...studio,
          draftSelectedItems: [...studio.draftSelectedItems, { exerciseId: press.id, sets: 3, reps: 10, weight: 0 }],
        }}
      />,
    );
    expect(screen.queryByRole("button", { name: `Add ${press.name} to workout` })).not.toBeInTheDocument();
  });
});
