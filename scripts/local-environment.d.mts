/** Initializes local runtime credentials without replacing configured database settings.
 * @param {string} projectRoot - Directory containing the root environment file.
 * @param {string | undefined} [configuredToken] - Explicit process credential.
 * @returns {Promise<void>} Configuration initialization completion.
 */
export function initializeLocalEnvironment(projectRoot: string, configuredToken?: string): Promise<void>;
