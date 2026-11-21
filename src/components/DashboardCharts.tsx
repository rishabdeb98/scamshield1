import { useMemo, useState } from 'react';
import type { HistoryItem, RiskLevel } from '../types/scamshield';
import { computeDailyActivity, RISK_TIERS, type OverviewStats } from '../utils/analytics';

interface DashboardChartsProps {
  items: HistoryItem[];
  stats: OverviewStats;
  onSelectRiskFilter: (level: RiskLevel) => void;
}

export function DashboardCharts({ items, stats, onSelectRiskFilter }: DashboardChartsProps) {
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(7);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  const dailySeries = useMemo(() => computeDailyActivity(items, rangeDays), [items, rangeDays]);

  // Chart A: Donut calculations
  const donutSegments = useMemo(() => {
    const counts: Record<RiskLevel, number> = {
      LOW: stats.lowCount,
      MEDIUM: stats.mediumCount,
      HIGH: stats.highCount,
      CRITICAL: stats.criticalCount,
    };

    const total = stats.totalScans;
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    let accumulatedPct = 0;

    return RISK_TIERS.map((tier) => {
      const count = counts[tier.level];
      const pct = total > 0 ? (count / total) * 100 : 0;
      const strokeLength = (pct / 100) * circumference;
      const strokeOffset = -((accumulatedPct / 100) * circumference);
      accumulatedPct += pct;
      return {
        ...tier,
        count,
        pct: Math.round(pct),
        strokeLength,
        strokeOffset,
        circumference,
      };
    });
  }, [stats]);

  // Chart B: Line chart geometry (viewBox 560 x 210)
  const chartWidth = 560;
  const chartHeight = 210;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 30;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const maxDailyVal = Math.max(
    1,
    ...dailySeries.map((pt) => pt.totalScans),
  );
  // Nice integer Y-axis ceiling
  const yMax = maxDailyVal <= 4 ? 4 : Math.ceil(maxDailyVal / 2) * 2;
  const yTicks = [0, Math.round(yMax / 2), yMax];

  const coords = dailySeries.map((pt, idx) => {
    const x =
      dailySeries.length === 1
        ? padLeft + plotW / 2
        : padLeft + (idx / (dailySeries.length - 1)) * plotW;
    const yTotal = padTop + plotH - (pt.totalScans / yMax) * plotH;
    const yHigh = padTop + plotH - (pt.highRiskScans / yMax) * plotH;
    return { x, yTotal, yHigh, pt };
  });

  const totalLinePath = coords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.yTotal.toFixed(1)}`)
    .join(' ');
  const highLinePath = coords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.yHigh.toFixed(1)}`)
    .join(' ');

  const areaPath =
    coords.length > 0
      ? `${totalLinePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
      : '';

  // X-axis tick indices (~4-6 readable labels)
  const xTickIndices = useMemo(() => {
    if (dailySeries.length <= 7) return dailySeries.map((_, i) => i);
    const step = Math.ceil((dailySeries.length - 1) / 5);
    const indices: number[] = [];
    for (let i = 0; i < dailySeries.length; i += step) {
      indices.push(i);
    }
    if (indices[indices.length - 1] !== dailySeries.length - 1) {
      indices.push(dailySeries.length - 1);
    }
    return indices;
  }, [dailySeries]);

  const activePoint =
    hoveredDayIndex !== null && coords[hoveredDayIndex] ? coords[hoveredDayIndex] : null;

  return (
    <section aria-label="Analytics Charts" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Chart A: Risk Distribution Donut */}
      <div className="lg:col-span-5 bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
            Risk Distribution
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#A7B4C7] mt-0.5">
            Breakdown across Low, Medium, High, and Critical risk classifications
          </p>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-36 h-36 shrink-0">
            <svg
              viewBox="0 0 140 140"
              className="w-full h-full -rotate-90"
              role="img"
              aria-label="Risk distribution donut chart"
            >
              <circle
                cx="70"
                cy="70"
                r="56"
                fill="none"
                className="stroke-slate-100 dark:stroke-[#273449]"
                strokeWidth="16"
              />
              {stats.totalScans > 0 &&
                donutSegments.map(
                  (seg) =>
                    seg.count > 0 && (
                      <circle
                        key={seg.level}
                        cx="70"
                        cy="70"
                        r="56"
                        fill="none"
                        stroke={seg.hex}
                        strokeWidth="16"
                        strokeDasharray={`${seg.strokeLength} ${seg.circumference}`}
                        strokeDashoffset={seg.strokeOffset}
                        className="transition-all duration-300"
                      />
                    ),
                )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-[#F8FAFC]">
                {stats.totalScans}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#A7B4C7]">
                Total Scans
              </span>
            </div>
          </div>

          <div className="w-full space-y-2.5">
            {donutSegments.map((seg) => (
              <button
                key={seg.level}
                type="button"
                onClick={() => onSelectRiskFilter(seg.level)}
                className="w-full flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111827] transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: seg.hex }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                    {seg.title}
                  </span>
                </div>
                <div className="text-xs font-mono tabular-nums text-slate-900 dark:text-[#F8FAFC] shrink-0">
                  <span className="font-semibold">{seg.count}</span>
                  <span className="text-slate-400 dark:text-[#A7B4C7] ml-1.5">({seg.pct}%)</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart B: Scanning Activity Line Chart */}
      <div className="lg:col-span-7 bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Scanning Activity
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#A7B4C7] mt-0.5">
              Daily total scans vs. high &amp; critical risk detections
            </p>
          </div>

          <div
            role="group"
            aria-label="Select scanning activity time range"
            className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#111827] border border-transparent dark:border-[#273449] rounded-lg"
          >
            {([7, 30, 90] as const).map((days) => {
              const active = rangeDays === days;
              return (
                <button
                  key={days}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setRangeDays(days);
                    setHoveredDayIndex(null);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white dark:bg-[#172033] text-slate-900 dark:text-[#F8FAFC] shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  Last {days} days
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
                <span className="w-3 h-0.5 bg-blue-600 dark:bg-blue-400 inline-block" aria-hidden="true" />
                Total Scans
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
                <span className="w-3 h-0.5 bg-red-600 dark:bg-red-400 inline-block" aria-hidden="true" />
                High / Critical Risk
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] font-mono tabular-nums text-slate-700 dark:text-slate-200 min-h-[1.5rem]">
              {activePoint
                ? `${activePoint.pt.label}: ${activePoint.pt.totalScans} total · ${activePoint.pt.highRiskScans} high/critical`
                : `Showing ${rangeDays}-day window`}
            </div>
          </div>

          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-52 overflow-visible"
            role="img"
            aria-label={`Line chart of daily scans over the last ${rangeDays} days`}
            onMouseLeave={() => setHoveredDayIndex(null)}
          >
            {/* Horizontal grid lines */}
            {yTicks.map((tick) => {
              const y = padTop + plotH - (tick / yMax) * plotH;
              return (
                <g key={tick}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={chartWidth - padRight}
                    y2={y}
                    className="stroke-slate-200 dark:stroke-[#273449]"
                    strokeDasharray={tick === 0 ? undefined : '3 3'}
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 dark:fill-[#A7B4C7] text-[10px] font-mono"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Subtle area fill for total scans */}
            {areaPath && (
              <path d={areaPath} className="fill-blue-600 dark:fill-blue-400" fillOpacity="0.1" />
            )}

            {/* Total scans line */}
            {totalLinePath && (
              <path
                d={totalLinePath}
                fill="none"
                className="stroke-blue-600 dark:stroke-blue-400"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* High/critical risk line */}
            {highLinePath && (
              <path
                d={highLinePath}
                fill="none"
                className="stroke-red-600 dark:stroke-red-400"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Interactive hover guide and points */}
            {activePoint && (
              <line
                x1={activePoint.x}
                y1={padTop}
                x2={activePoint.x}
                y2={padTop + plotH}
                className="stroke-slate-400 dark:stroke-slate-500"
                strokeDasharray="2 2"
              />
            )}

            {coords.map((c, idx) => (
              <g key={c.pt.dateKey}>
                {(dailySeries.length <= 14 || hoveredDayIndex === idx || c.pt.totalScans > 0) && (
                  <>
                    <circle
                      cx={c.x}
                      cy={c.yTotal}
                      r={hoveredDayIndex === idx ? 4.5 : 2.8}
                      className="fill-blue-600 dark:fill-blue-400"
                    />
                    {c.pt.highRiskScans > 0 && (
                      <circle
                        cx={c.x}
                        cy={c.yHigh}
                        r={hoveredDayIndex === idx ? 4.5 : 2.8}
                        className="fill-red-600 dark:fill-red-400"
                      />
                    )}
                  </>
                )}
                <rect
                  x={c.x - plotW / Math.max(1, dailySeries.length) / 2}
                  y={padTop}
                  width={Math.max(8, plotW / Math.max(1, dailySeries.length))}
                  height={plotH}
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${c.pt.label}: ${c.pt.totalScans} total scans, ${c.pt.highRiskScans} high or critical`}
                  onMouseEnter={() => setHoveredDayIndex(idx)}
                  onFocus={() => setHoveredDayIndex(idx)}
                  onBlur={() => setHoveredDayIndex(null)}
                />
              </g>
            ))}

            {/* X-axis date labels */}
            {xTickIndices.map((idx) => {
              const c = coords[idx];
              if (!c) return null;
              return (
                <text
                  key={c.pt.dateKey}
                  x={c.x}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-[#A7B4C7] text-[10px] font-mono"
                >
                  {c.pt.label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
