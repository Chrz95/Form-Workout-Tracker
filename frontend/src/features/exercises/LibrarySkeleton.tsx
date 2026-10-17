/** Reserves catalog card space while the real exercise library loads.
 * @returns {JSX.Element} Accessible, decorative loading placeholders.
 */
export function LibrarySkeleton() {
  return (
    <div
      className="library-loading"
      role="status"
      aria-label="Loading your exercise library"
    >
      <span className="visually-hidden">Loading your exercise library…</span>
      <div
        className="exercise-grid"
        aria-hidden="true"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="skeleton-card"
            key={index}
          >
            <div className="skeleton-image" />
            <div className="skeleton-copy">
              <span />
              <span />
              <span />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
