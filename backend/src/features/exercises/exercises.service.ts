import { randomUUID } from "node:crypto";
import type { CustomExerciseInput } from "../../../../shared/customExerciseContracts.js";
import { customExerciseIdentifierSchema } from "../../../../shared/customExerciseContracts.js";
import { CUSTOM_EXERCISE_PREFIX, CUSTOM_EXERCISE_SOURCE } from "../../../../shared/exerciseConstants.js";
import { HTTP_STATUS } from "../../../../shared/constants.js";
import { AppError } from "../../lib/errors/AppError.js";
import type { ExerciseRepository } from "./exercises.types.js";
import { getExerciseNameKey } from "../../../../shared/exerciseIdentity.js";
/** Preserves imported references while allowing private authored catalog extensions. */
export class ExerciseService {
  /** Injects the PostgreSQL persistence boundary.
   * @param {ExerciseRepository} repository - Exercise persistence.
   */
  constructor(private readonly repository: ExerciseRepository) {}
  /** Returns discovery entries while preserving historical references in storage.
   * @returns {Promise<Exercise[]>} References.
   */
  list() {
    return this.repository
      .list()
      .then((records) => records.filter((exercise) => !exercise.canonicalId && !exercise.isArchived));
  }
  /** Returns authored entries for private catalog merging.
   * @returns {Promise<Exercise[]>} Owner exercises.
   */
  listCustom() {
    return this.repository.listCustom();
  }
  /** Creates or updates a private exercise while retaining its stable history identity.
   * @param {CustomExerciseInput} input - Validated content.
   * @param {string | undefined} id - Existing custom identity.
   * @returns {Promise<Exercise>} Saved custom exercise.
   */
  async save(input: CustomExerciseInput, id?: string) {
    if (id) {
      customExerciseIdentifierSchema.parse({ id });
    }
    const key = getExerciseNameKey(input.name);
    if (
      (await this.repository.list()).some(
        (record) =>
          record.id !== id &&
          !record.canonicalId &&
          [record.name, ...(record.aliases ?? [])].some((name) => getExerciseNameKey(name) === key),
      )
    ) {
      throw new AppError(
        "DUPLICATE_EXERCISE",
        "This movement already exists in your library. Use its existing entry.",
        HTTP_STATUS.conflict,
      );
    }
    const { imageUrl, ...content } = input;
    const exercise = {
      ...content,
      id: id ?? `${CUSTOM_EXERCISE_PREFIX}${randomUUID()}`,
      images: imageUrl ? [imageUrl] : [],
      source: CUSTOM_EXERCISE_SOURCE,
    };
    let saved;
    try {
      saved = id ? await this.repository.update(exercise) : await this.repository.create(exercise);
    } catch (error) {
      const cause = error instanceof Error && "cause" in error ? error.cause : error;
      if (cause && typeof cause === "object" && "code" in cause && cause.code === "23505") {
        throw new AppError(
          "DUPLICATE_EXERCISE",
          "This movement already exists in your library. Use its existing entry.",
          HTTP_STATUS.conflict,
        );
      }
      throw error;
    }
    if (!saved) {
      throw new AppError("NOT_FOUND", "This custom exercise could not be found.", HTTP_STATUS.notFound);
    }
    return saved;
  }
  /** Removes only an unused custom exercise; referenced records never cascade away.
   * @param {string} id - Custom identity.
   * @returns {Promise<null>} Successful deletion.
   */
  async remove(id: string) {
    customExerciseIdentifierSchema.parse({ id });
    try {
      if (!(await this.repository.remove(id))) {
        throw new AppError("NOT_FOUND", "This custom exercise could not be found.", HTTP_STATUS.notFound);
      }
    } catch (error) {
      const cause = error instanceof Error && "cause" in error ? error.cause : error;
      if (cause && typeof cause === "object" && "code" in cause && cause.code === "23503") {
        throw new AppError(
          "EXERCISE_IN_USE",
          "This exercise is used in a routine or journal entry. Keep it to preserve your records.",
          HTTP_STATUS.conflict,
        );
      }
      throw error;
    }
    return null;
  }
}
