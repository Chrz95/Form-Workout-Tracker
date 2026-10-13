import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import type { Studio } from "../../../app/useStudio";
import type { Exercise } from "../../../../../shared/contracts";
import { ImportCsvDialog } from "./ImportCsvDialog";
import { createTrainingCsv } from "../export/exportCsv";
vi.mock("../../../components/ui/Modal", () => ({
  Modal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
afterEach(cleanup);
const exercise: Exercise = {
  id: "bench",
  name: "Bench press",
  level: "beginner",
  equipment: "barbell",
  category: "strength",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  instructions: [],
  images: [],
};
const workout = {
  id: "6bb6f3f5-6c48-47da-a2f0-d6427be73828",
  name: "Upper day",
  notes: "Control the descent",
  createdAt: "2026-10-12T12:00:00.000Z",
  items: [{ exerciseId: "bench", sets: 3, reps: 10, weight: 40 }],
};
/** Supplies the browser's File.text capability in the DOM test environment.
 * @returns {File} A valid local workout export.
 */
function exportFile(): File {
  const content = createTrainingCsv({ kind: "workouts", records: [workout], exercises: [exercise] });
  const file = new File([content], "form-workouts.csv", { type: "text/csv" });
  Object.defineProperty(file, "text", { value: async () => content });
  return file;
}
/** Supplies only the view-model capabilities used by the import dialog.
 * @param {Partial<Studio>} [overrides] - Connection or persistence outcomes.
 * @returns {Studio} Test view model.
 */
function studioFixture(overrides: Partial<Studio> = {}): Studio {
  return {
    workouts: [],
    sessions: [],
    exercises: [exercise],
    isPending: false,
    isConnected: true,
    hasImportSupport: true,
    apiError: "",
    setApiError: vi.fn(),
    persistImport: vi.fn(async () => true),
    ...overrides,
  } as unknown as Studio;
}
describe("CSV review and explicit commit", () => {
  it("reviews locally while disconnected and prevents saving", async () => {
    const user = userEvent.setup();
    const studio = studioFixture({ isConnected: false });
    render(
      <ImportCsvDialog
        studio={studio}
        kind="workouts"
        onClose={vi.fn()}
      />,
    );
    await user.upload(screen.getByLabelText("CSV file"), exportFile());
    expect(await screen.findByText("Upper day")).toBeInTheDocument();
    expect(screen.getByText("Control the descent")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm import" })).toBeDisabled();
    expect(studio.persistImport).not.toHaveBeenCalled();
  });
  it("sends the reviewed batch only after confirmation and closes after success", async () => {
    const user = userEvent.setup();
    const studio = studioFixture();
    const onClose = vi.fn();
    render(
      <ImportCsvDialog
        studio={studio}
        kind="workouts"
        onClose={onClose}
      />,
    );
    await user.upload(screen.getByLabelText("CSV file"), exportFile());
    await screen.findByText("Upper day");
    expect(studio.persistImport).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Confirm import" }));
    expect(studio.persistImport).toHaveBeenCalledExactlyOnceWith({ kind: "workouts", records: [workout] });
    expect(onClose).toHaveBeenCalledOnce();
  });
  it("keeps the reviewed file open after a failed API save", async () => {
    const user = userEvent.setup();
    const studio = studioFixture({ persistImport: vi.fn(async () => false) });
    const onClose = vi.fn();
    render(
      <ImportCsvDialog
        studio={studio}
        kind="workouts"
        onClose={onClose}
      />,
    );
    await user.upload(screen.getByLabelText("CSV file"), exportFile());
    await screen.findByText("Upper day");
    await user.click(screen.getByRole("button", { name: "Confirm import" }));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText("Upper day")).toBeInTheDocument();
  });
  it("blocks a conflicting saved identity before sending a request", async () => {
    const user = userEvent.setup();
    const studio = studioFixture({ workouts: [{ ...workout, notes: "Changed after export" }] });
    render(
      <ImportCsvDialog
        studio={studio}
        kind="workouts"
        onClose={vi.fn()}
      />,
    );
    await user.upload(screen.getByLabelText("CSV file"), exportFile());
    expect(await screen.findByText(/Saved ID has different values/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm import" })).toBeDisabled();
    expect(studio.persistImport).not.toHaveBeenCalled();
  });
});
