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
  if (!data) return null;

  const modifiedData = Object.entries(data).map(([key, value]) => {
    return {
      name: key,
      money: value,
    };
  });

  return (
    <div className={"chart-container"}>
      {loading ? (
        <BarChartSkeleton />
      ) : (
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <BarChart title={label} data={modifiedData} responsive barSize={32} margin={{ bottom: 44, left: 10 }}>
            <XAxis dataKey={"name"} tick={{ fontSize: 13 }} angle={-25} textAnchor="middle" interval={0} />
            <YAxis
              width={80}
              tick={{ fontSize: 13 }}
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-US", {
                  notation: "compact",
                  compactDisplay: "short",
                  style: "currency",
                  currency: "USD", // Change to "INR" or your preferred currency
                }).format(value)
              }
            />
            <Tooltip
              formatter={(value) =>
                new Intl.NumberFormat("en-US", {
                  notation: "standard",
                  compactDisplay: "short",
                  style: "currency",
                  currency: "USD", // Change to "INR" or your preferred currency
                }).format(value)
              }
            />
            <Bar
              dataKey="money"
              activeBar={{ fill: "blue", stroke: "blue" }}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
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
