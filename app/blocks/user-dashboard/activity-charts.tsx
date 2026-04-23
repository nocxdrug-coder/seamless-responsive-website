import styles from "./activity-charts.module.css";

interface ChartDay {
  date: string;
  deposits: number;
  orders: number;
}

interface ServerData {
  chartData?: ChartDay[];
}

function DynamicLineChart({ data, color, dataKey }: { data: ChartDay[]; color: string; dataKey: "deposits" | "orders" }) {
  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => Math.max(d[dataKey], 10))); // ensure scale doesn't crash on 0
  const yLabels = Array.from({ length: 6 }, (_, i) => {
    const val = maxVal - (maxVal / 5) * i;
    return val >= 100 ? Math.round(val).toString() : val.toFixed(1);
  });

  const points = data.map((d, i) => {
    const x = 30 + (i / (data.length - 1)) * 220;
    // Map value to Y: 10 (top) to 95 (bottom) representing 0
    const ratio = d[dataKey] / maxVal;
    const y = 95 - (ratio * 85);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className={styles.chartSvg} viewBox="0 0 260 110" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const x = 30 + (i / (data.length - 1)) * 220;
        const ratio = d[dataKey] / maxVal;
        const y = 95 - (ratio * 85);
        return (
          <g key={d.date}>
            <circle cx={x} cy={y} r={3} fill={color} />
            {i % 3 === 0 && (
              <text x={x} y={108} textAnchor="middle" fontSize="6" fill="#555" fontFamily="monospace">
                {d.date}
              </text>
            )}
          </g>
        );
      })}
      {yLabels.map((label, i) => (
        <text key={label} x={26} y={10 + i * 17} textAnchor="end" fontSize="6" fill="#555" fontFamily="monospace">
          {label}
        </text>
      ))}
    </svg>
  );
}

export function ActivityCharts({ serverData }: { serverData?: ServerData }) {
  const chartData = serverData?.chartData ?? [];

  return (
    <div className={styles.grid}>
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <span className={styles.chartTitle}>Deposits &mdash; Last 14 Days</span>
          <span className={styles.chartBadge}>Trend</span>
        </div>
        <div className={styles.chartArea}>
          <DynamicLineChart data={chartData} color="#6366f1" dataKey="deposits" />
        </div>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <span className={styles.chartTitle}>Orders &mdash; Last 14 Days</span>
          <span className={styles.chartBadge}>Activity</span>
        </div>
        <div className={styles.chartArea}>
          <DynamicLineChart data={chartData} color="#22c55e" dataKey="orders" />
        </div>
      </div>
    </div>
  );
}
