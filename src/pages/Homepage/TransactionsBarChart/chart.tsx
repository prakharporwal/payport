import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./chart.css";

export function TransactionsBarChart({ label, data, loading }) {
  const modifiedData = useMemo(
    () =>
      data
        ? Object.entries(data).map(([key, value]) => ({
            name: key,
            money: (value as any)?.amount,
          }))
        : [],
    [data]
  );

  if (loading) return <div className={"chart-container"}><BarChartSkeleton /></div>;
  if (!data) return null;

  return (
    <div className={"chart-container"}>
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <BarChart title={label} data={modifiedData} responsive barSize={20} margin={{ bottom: 44, left: 10 }}>
          <XAxis dataKey={"name"} tick={{ fontSize: 13 }} angle={-25} textAnchor="middle" interval={0} />
          <YAxis
            width={100}
            tick={{ fontSize: 13 }}
            tickFormatter={(value) =>
              new Intl.NumberFormat("en-US", {
                notation: "compact",
                compactDisplay: "short",
                style: "currency",
                currency: "USD",
              }).format(value)
            }
          />
          <Tooltip
            formatter={(value) =>
              typeof value === "number"
                ? new Intl.NumberFormat("en-US", {
                    notation: "standard",
                    compactDisplay: "short",
                    style: "currency",
                    currency: "USD",
                  }).format(value)
                : value
            }
          />
          <Bar
            dataKey="money"
            fill="#09090B"
            activeBar={{ fill: "blue", stroke: "blue" }}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarChartSkeleton() {
  return (
    <div className="skeleton-chart">
      <div className="skeleton-bar"></div>
      <div className="skeleton-bar"></div>
      <div className="skeleton-bar"></div>
      <div className="skeleton-bar"></div>
      <div className="skeleton-bar"></div>
    </div>
  );
}
