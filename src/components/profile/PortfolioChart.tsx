import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface PortfolioChartProps {
  data: ChartData[];
}

const COLORS = ["#2563eb", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#64748b"];

export default function PortfolioChart({ data }: PortfolioChartProps) {
  return (
    <div className="h-87.5 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col">
      <h3 className="font-semibold mb-2 text-slate-700">Allocation by Value</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, "Value"]} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}