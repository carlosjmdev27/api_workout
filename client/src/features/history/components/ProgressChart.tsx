import type { JSX } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatNumber, formatShortDate } from '../../../utils/format';

export interface ChartPoint {
  id: string;
  date: string; // ISO
  value: number;
  detail: string; // Secondary tooltip line, e.g. "mejor serie 100 lb × 7"
}

interface ProgressChartProps {
  points: ChartPoint[];
  /** Accessible name; the visible title is rendered by the parent. */
  label: string;
  unit: string;
  /** Theme token of the series, e.g. "var(--chart-1)". */
  color: string;
}

const HEIGHT = 220;
const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 12 };

interface ChartTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
  unit: string;
  color: string;
}

const isChartPoint = (value: unknown): value is ChartPoint =>
  typeof value === 'object' && value !== null && 'value' in value && 'date' in value && 'detail' in value;

/** Text uses text tokens; the coloured dot carries the series identity. */
function ChartTooltip({ active, payload, unit, color }: ChartTooltipProps): JSX.Element | null {
  const raw = payload?.[0]?.payload;
  const point = isChartPoint(raw) ? raw : undefined;
  if (!active || !point) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">{formatShortDate(point.date)}</p>
      <p className="flex items-center gap-1.5 font-semibold tabular-nums text-foreground">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden="true" />
        {formatNumber(point.value)} {unit}
      </p>
      <p className="text-muted-foreground">{point.detail}</p>
    </div>
  );
}

/**
 * Single-series line chart (Recharts): one metric over time, crosshair + tooltip on hover,
 * arrow-key navigation (Recharts accessibility layer). The table below it is the table view.
 */
export function ProgressChart({ points, label, unit, color }: ProgressChartProps): JSX.Element {
  return (
    <div className="h-[220px] w-full" role="figure" aria-label={label}>
      <ResponsiveContainer width="100%" height={HEIGHT}>
        <LineChart data={points} margin={{ top: 12, right: 16, bottom: 4, left: 0 }} accessibilityLayer title={label}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatShortDate(value)}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            minTickGap={24}
          />
          <YAxis
            width={48}
            domain={['auto', 'auto']}
            tickFormatter={(value: number) => formatNumber(value)}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            allowDecimals
          />
          <Tooltip
            cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '4 4' }}
            content={({ active, payload }) => <ChartTooltip active={active} payload={payload} unit={unit} color={color} />}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4, fill: color, stroke: 'var(--card)', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: color, stroke: 'var(--card)', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
