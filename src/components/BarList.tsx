import type { Slice } from '../lib/breakdown';

interface Props {
  slices: Slice[];
  format: (value: number) => string;
}

/**
 * Horizontal bar breakdown — each row a category with a proportional bar and
 * formatted value. Bars are scaled to the largest slice.
 */
export function BarList({ slices, format }: Props) {
  const max = slices.reduce((m, s) => Math.max(m, s.value), 0);

  return (
    <ul className="barlist">
      {slices.map((s) => (
        <li key={s.label}>
          <span className="bar-label" title={s.label}>
            {s.label}
          </span>
          <span className="bar-track">
            <span
              className="bar-fill"
              style={{ width: max > 0 ? `${(s.value / max) * 100}%` : '0%' }}
            />
          </span>
          <span className="bar-value">{format(s.value)}</span>
        </li>
      ))}
    </ul>
  );
}
