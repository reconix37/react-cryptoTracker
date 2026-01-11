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

  return (
    <div className="h-full w-full bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border flex flex-col transition-colors duration-300">

      <h3 className="font-bold text-2xl mb-4 text-foreground/90">
        Allocation by Value
      </h3>

      <div className="flex-1 w-full min-h-75">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={8}
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
                backgroundColor: isDark ? "var(--popover)" : "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                color: "var(--popover-foreground)"
              }}
              itemStyle={{ color: "var(--popover-foreground)" }}
              cursor={{ fill: 'transparent' }}
              formatter={(value: number | undefined) => [
                `$${(value ?? 0).toLocaleString()}`,
                "Value"
              ]}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "1rem",
                fontWeight: "500",
                color: "var(--muted-foreground)"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}