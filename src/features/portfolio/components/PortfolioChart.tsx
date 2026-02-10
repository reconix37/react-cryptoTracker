import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useThemes } from "@/globalHooks/useThemes";
import type { AllocationItem } from "@/types/AllcoationItem";


interface PortfolioChartProps {
   data: AllocationItem[];
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

  const cleanData = data?.filter(item => item.value > 0) || [];

  if (cleanData.length === 0) {
    return (
      <div className="h-[480px] w-full flex items-center justify-center text-muted-foreground italic">
        No asset data available to display.
      </div>
    );
  }

  return (
    <div className="w-full h-[480px] flex flex-col">
      <h3 className="font-bold text-2xl mb-2 text-foreground/90 text-center shrink-0">
        Allocation by Value
      </h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={cleanData}
              cx="50%"
              cy="45%"
              innerRadius="50%"
              outerRadius="85%"
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {cleanData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{ filter: isDark ? 'brightness(0.9) saturate(1.2)' : 'none' }}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--popover-foreground))",
              }}
              itemStyle={{ color: "hsl(var(--popover-foreground))" }}
              cursor={{ fill: 'transparent' }}
              formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, "Value"]}
            />
            <Legend
              verticalAlign="bottom"
              height={40}
              iconType="circle"
              iconSize={10}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}