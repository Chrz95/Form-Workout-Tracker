import { z } from "zod";
/** Public guide links retain publisher ownership; no third-party media is bundled. */
export const exerciseGuideSchema = z
  .object({
    provider: z.enum(["MuscleWiki", "Muscle & Strength", "FITTR"]),
    title: z.string().min(1).max(200),
    url: z
      .url()
      .refine(
        (value) =>
          value === "https://www.muscleandstrength.com/exercises/cable-crossovers-(mid-chest).html" ||
          /^https:\/\/www\.fittr\.com\/exercise-video\/[a-z0-9-]+\/$/.test(value) ||
          /^https:\/\/musclewiki\.com\/exercise\/[a-z0-9-]+$/.test(value) ||
          /^https:\/\/www\.muscleandstrength\.com\/exercises\/[a-z0-9-]+(?:\.html)?$/.test(value),
        "Public exercise guide URL required",
      ),
    videoUrl: z
      .string()
      .refine(
        (value) =>
          /^https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}$/.test(value) ||
          /^https:\/\/vimeo\.com\/[0-9]{6,12}$/.test(value),
        "Public video URL required",
      )
      .optional(),
    checkedAt: z.iso.date(),
  })
  .refine(
    (guide) =>
      guide.provider === "MuscleWiki"
        ? guide.url.startsWith("https://musclewiki.com/")
        : guide.provider === "FITTR"
          ? guide.url.startsWith("https://www.fittr.com/")
          : guide.url.startsWith("https://www.muscleandstrength.com/"),
    "Publisher must match the guide URL",
  );
/** A checked external guide, independent of the catalog's text and image licenses. */
export type ExerciseGuide = z.infer<typeof exerciseGuideSchema>;
