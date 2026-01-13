import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useThemes } from "@/hooks/useThemes";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface PortfolioChartProps {
  data: ChartData[];
}

const COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444"
];

export default function PortfolioChart({ data }: PortfolioChartProps) {
  const { theme } = useThemes();
  const isDark = theme === "dark";

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] w-full bg-card p-6 rounded-xl flex items-center justify-center text-muted-foreground italic">
        No asset data available to display.
      </div>
    );
  }

  return (
    <div className="h-[450px] w-full bg-card text-card-foreground p-6 rounded-xl flex flex-col transition-colors duration-300">
      <h3 className="font-bold text-2xl mb-4 sm:mb-8 text-foreground/90">
        Allocation by Value
      </h3>

      <div className="flex-1 w-full min-h-[300px] relative">
        <ResponsiveContainer width="99%" height={350}>
          <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{ filter: isDark ? 'brightness(0.9) saturate(1.2)' : 'none' }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                color: "var(--popover-foreground)"
              }}
              itemStyle={{ color: "var(--popover-foreground)" }}
              cursor={{ fill: 'transparent' }}
              formatter={(value: number | undefined) => [
                `$${(value ?? 0).toLocaleString()}`,
                "Value"
              ]}
            />
            <Legend verticalAlign="bottom" align="center" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}