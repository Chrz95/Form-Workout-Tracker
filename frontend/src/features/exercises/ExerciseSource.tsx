import type { Exercise } from "../../../../shared/contracts";
/** Catalog content whose licensing is displayed in place. */
interface ExerciseSourceProps {
  /** Text provenance and independently licensed media, if present. */
  exercise: Exercise;
}
/** Keeps imported descriptions and media attribution visible without implying one blanket license.
 * @param {ExerciseSourceProps} props - Source metadata.
 * @param {Exercise} props.exercise - Catalog content.
 * @returns {JSX.Element} Attribution and license links.
 */
export function ExerciseSource({ exercise }: ExerciseSourceProps) {
  const source = exercise.source ?? { name: "Free Exercise DB", license: "Public domain · Unlicense" };
  return (
    <details className="exercise-source">
      <summary>
        Source: {source.name} · {source.license}
      </summary>
      {source.attribution && <p>{source.attribution}</p>}
      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
        >
          Original exercise data
        </a>
      )}
      {source.licenseUrl && (
        <a
          href={source.licenseUrl}
          target="_blank"
          rel="noreferrer"
        >
          Text license
        </a>
      )}
      {source.changes && <small>{source.changes}</small>}
      <a
        href="/catalog-licenses.html"
        target="_blank"
        rel="noreferrer"
      >
        Catalog notices and bundled license texts
      </a>
      {exercise.media?.map((asset) => (
        <p key={asset.url}>
          Image by {asset.author} ·{" "}
          <a
            href={asset.licenseUrl}
            target="_blank"
            rel="noreferrer"
          >
            {asset.license}
          </a>
          {" · "}
          <a
            href={asset.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Original image
          </a>
          {" · "}
          {asset.changes ?? "resized and converted to WebP"}
        </p>
      ))}
    </details>
  );
}
