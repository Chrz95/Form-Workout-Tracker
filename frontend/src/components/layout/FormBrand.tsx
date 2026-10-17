/** Renders Form's compact wordmark and geometric monogram.
 * @returns {JSX.Element} Home link.
 */
export function FormBrand() {
  return (
    <a
      className="brand"
      href="/"
      aria-label="Form home"
    >
      <span
        className="brand-symbol"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M9 25V8h17M9 16h12"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            d="M20 24h6"
            stroke="currentColor"
            strokeWidth="4"
          />
        </svg>
      </span>
      <span className="brand-wordmark">
        form<span className="brand-period">.</span>
      </span>
    </a>
  );
}
