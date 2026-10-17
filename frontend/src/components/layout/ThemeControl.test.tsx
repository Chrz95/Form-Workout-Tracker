import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeControl } from "./ThemeControl";

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("Appearance preference", () => {
  it("retains an explicit appearance when the app is reopened", async () => {
    const user = userEvent.setup();
    const view = render(<ThemeControl />);
    await user.selectOptions(screen.getByLabelText("Appearance"), "dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    view.unmount();
    render(<ThemeControl />);
    expect(screen.getByLabelText("Appearance")).toHaveValue("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    await user.selectOptions(screen.getByLabelText("Appearance"), "system");
    expect(document.documentElement.dataset.theme).toBe("light");
  });
  it("still switches themes if browser preference storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const user = userEvent.setup();
    render(<ThemeControl />);
    await user.selectOptions(screen.getByLabelText("Appearance"), "dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
