/** Reports a minimal rendering diagnostic without props, records, tokens or stack payloads.
 * @param {Error} error - Unexpected rendering failure.
 */
export function reportRenderingFailure(error: Error) {
  console.error("Form rendering failure", { errorType: error.name });
}
