import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Demonstration } from "./Demonstration";
import type { Exercise } from "../../../../shared/contracts";
const exercise: Exercise = {
  id: "bench",
  name: "Bench press",
  level: "beginner",
  category: "strength",
  equipment: "barbell",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  instructions: [],
  images: ["/photo.webp"],
};
const credit = {
  author: "Source author",
  license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  sourceUrl: "https://example.org/source",
};
beforeEach(() =>
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: true })),
  ),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("Preferred real motion demonstrations", () => {
  it("keeps genuine GIF motion stopped until requested, ahead of still photographs", async () => {
    const user = userEvent.setup();
    render(
      <Demonstration
        exercise={{ ...exercise, media: [{ ...credit, url: "/guide.gif", stillUrl: "/poster.webp", frameCount: 20 }] }}
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute("src", "/poster.webp");
    await user.click(screen.getByRole("button", { name: "Play animation" }));
    expect(screen.getByRole("img")).toHaveAttribute("src", "/guide.gif");
    await user.click(screen.getByRole("button", { name: "Stop motion" }));
    expect(screen.getByRole("img")).toHaveAttribute("src", "/poster.webp");
  });
  it("labels published AI illustrations and keeps them as manually browsed static positions", async () => {
    const user = userEvent.setup();
    render(
      <Demonstration
        exercise={{
          ...exercise,
          images: ["/first.svg", "/second.svg"],
          media: [{ ...credit, author: "Flow — AI-generated illustration", url: "/first.svg" }],
        }}
      />,
    );
    expect(screen.getByText("AI-generated illustration · static positions")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Play" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next image →" }));
    expect(screen.getByRole("img")).toHaveAttribute("src", "/second.svg");
  });
  it("prefers a bundled video, avoids autoplay and retains source links after playback failure", () => {
    render(
      <Demonstration
        exercise={{
          ...exercise,
          videos: [
            { ...credit, url: "https://example.org/remote.mp4", codec: "h264" },
            {
              ...credit,
              url: "https://example.org/original.mov",
              codec: "h264",
              localUrl: "/exercise-motion/wger-21.mp4",
              posterUrl: "/exercise-motion/wger-21-still.webp",
            },
          ],
        }}
      />,
    );
    const video = screen.getByLabelText("Bench press technique video");
    expect(video).toHaveAttribute("src", "/exercise-motion/wger-21.mp4");
    expect(video).toHaveAttribute("preload", "none");
    expect(video).not.toHaveAttribute("autoplay");
    fireEvent.error(video);
    expect(screen.getByRole("alert")).toHaveTextContent("could not play");
    expect(screen.getByText("Original video 2")).toHaveAttribute("href", "https://example.org/original.mov");
  });
});
