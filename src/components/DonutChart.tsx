import { useMemo } from 'react';
import type { Slice } from '../lib/breakdown';
import { colorAt } from '../lib/colors';

interface Props {
  slices: Slice[];
  /** Format a value for the legend / center total. */
  format: (value: number) => string;
  /** Caption under the center total (e.g. "Market Value"). */
  centerLabel?: string;
}

const SIZE = 120;
const STROKE = 18;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

/**
 * Compact SVG donut with a legend. Segments are drawn as dash-array arcs on
 * stacked circles — no charting dependency. Values are summed for the center
 * total; slices are assumed pre-sorted/aggregated by the caller.
 */
export function DonutChart({ slices, format, centerLabel }: Props) {
  const total = useMemo(
    () => slices.reduce((sum, s) => sum + s.value, 0),
    [slices],
  );

  let offset = 0;
  const arcs = slices.map((s, i) => {
    const frac = total > 0 ? s.value / total : 0;
    const len = frac * C;
    const arc = (
      <circle
        key={s.label}
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        fill="none"
        stroke={colorAt(i)}
        strokeWidth={STROKE}
        strokeDasharray={`${len} ${C - len}`}
        strokeDashoffset={-offset}
      />
    );
    offset += len;
    return arc;
  });

  return (
    <div className="donut">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="donut-svg"
      >
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          {total > 0 ? (
            arcs
          ) : (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="var(--border)"
              strokeWidth={STROKE}
            />
          )}
        </g>
        <text x="50%" y="47%" className="donut-total">
          {format(total)}
        </text>
        {centerLabel && (
          <text x="50%" y="60%" className="donut-caption">
            {centerLabel}
          </text>
        )}
      </svg>
      <ul className="donut-legend">
        {slices.map((s, i) => (
          <li key={s.label}>
            <span className="swatch" style={{ background: colorAt(i) }} />
            <span className="legend-label" title={s.label}>
              {s.label}
            </span>
            <span className="legend-pct">
              {total > 0 ? `${((s.value / total) * 100).toFixed(1)}%` : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
