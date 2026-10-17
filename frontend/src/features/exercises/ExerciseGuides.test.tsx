import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Exercise } from "../../../../shared/contracts";
import { exerciseGuideSchema } from "../../../../shared/exerciseGuideContracts";
import { ExerciseGuides } from "./ExerciseGuides";
const guide = {
  provider: "MuscleWiki" as const,
  title: "Barbell Incline Bench Press",
  url: "https://musclewiki.com/exercise/barbell-incline-bench-press",
  videoUrl: "https://www.youtube.com/watch?v=Q5oKabCPV8k",
  checkedAt: "2026-10-15",
};
const exercise: Exercise = {
  id: "press",
  name: "Incline Barbell Bench Press",
  level: "intermediate",
  equipment: "barbell",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  instructions: [],
  images: [],
  category: "strength",
  guides: [guide],
};
afterEach(cleanup);
describe("Checked external exercise guides", () => {
  it("shows attributed guide links without contacting a third-party player before a click", async () => {
    const { container } = render(<ExerciseGuides exercise={exercise} />);
    const link = screen.getByRole("link", { name: /Barbell Incline Bench Press · MuscleWiki/ });
    expect(link).toHaveAttribute("href", guide.url);
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(screen.getByText("Link checked 2026-10-15")).toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Load MuscleWiki video" }));
    const player = screen.getByTitle("Barbell Incline Bench Press — MuscleWiki video");
    expect(player).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/Q5oKabCPV8k");
    expect(player.getAttribute("src")).not.toContain("autoplay");
    await userEvent.click(screen.getByRole("button", { name: "Close video" }));
    expect(container.querySelector("iframe")).toBeNull();
  });
  it("supports publisher Vimeo embeds and always retains the guide and direct video fallback", async () => {
    render(
      <ExerciseGuides
        exercise={{
          ...exercise,
          guides: [
            {
              provider: "Muscle & Strength",
              title: "Dumbbell Bench Press",
              url: "https://www.muscleandstrength.com/exercises/dumbbell-bench-press.html",
              videoUrl: "https://vimeo.com/123456789",
              checkedAt: guide.checkedAt,
            },
          ],
        }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Load Muscle & Strength video" }));
    expect(screen.getByTitle("Dumbbell Bench Press — Muscle & Strength video")).toHaveAttribute(
      "src",
      "https://player.vimeo.com/video/123456789?dnt=1",
    );
    expect(screen.getByRole("link", { name: "Watch on Vimeo" })).toHaveAttribute("href", "https://vimeo.com/123456789");
    expect(screen.getByRole("link", { name: /Dumbbell Bench Press · Muscle & Strength/ })).toBeInTheDocument();
  });
  it("does not invent a video when a guide has no embedded demonstration", () => {
    render(<ExerciseGuides exercise={{ ...exercise, guides: [{ ...guide, videoUrl: undefined }] }} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", guide.url);
  });
  it("does not show an empty guide section for exercises with existing local media only", () => {
    render(<ExerciseGuides exercise={{ ...exercise, guides: undefined }} />);
    expect(screen.queryByRole("region", { name: "External exercise guides" })).not.toBeInTheDocument();
  });
  it("limits publisher and player URLs to public guide paths and known video hosts", () => {
    expect(exerciseGuideSchema.safeParse(guide).success).toBe(true);
    for (const url of [
      "javascript:alert(1)",
      "https://musclewiki.com.evil.test/exercise/press",
      "https://musclewiki.com/api/exercises",
      "not a URL",
    ]) {
      expect(exerciseGuideSchema.safeParse({ ...guide, url }).success).toBe(false);
    }
    expect(exerciseGuideSchema.safeParse({ ...guide, provider: "Muscle & Strength" }).success).toBe(false);
    expect(exerciseGuideSchema.safeParse({ ...guide, videoUrl: "https://evil.test/video" }).success).toBe(false);
    expect(exerciseGuideSchema.safeParse({ ...guide, videoUrl: "https://vimeo.com/123456789" }).success).toBe(true);
  });
});
