import type { ReactNode } from 'react';

/** Titled container for a single chart inside the charts panel. */
export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      {children}
    </div>
  );
}
