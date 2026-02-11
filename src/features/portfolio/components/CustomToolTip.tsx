import type { TooltipContentProps } from "recharts";
import type { AllocationItem } from "@/types/AllcoationItem";
import { useThemes } from "@/globalHooks/useThemes";
import { cn } from "@/lib/utils";

export default function CustomTooltip(
    props: TooltipContentProps<number, string>
) {
    const { theme } = useThemes();
    const isDark = theme === "dark";

    const { active, payload } = props;

    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const item = payload[0];

    if (!item?.payload) return null;

    const data = item.payload as AllocationItem;

    return (
        <div
            className="rounded-lg border px-3 py-2 shadow-md"
            style={{
                backgroundColor: isDark ? "white" : "black",
                borderColor: "black",
            }}
        >
            <p className={cn("font-semibold text-sm", isDark ? "text-black" : "text-muted-foreground")}>
                {data.name}
            </p>

            <p className={cn("text-sm", isDark ? "text-black" : "text-muted-foreground")}>
                ${data.value.toLocaleString()}
            </p>

            <p className={cn("text-sm", isDark ? "text-black" : "text-muted-foreground")}>
                {data.percent.toFixed(2)}% of portfolio
            </p>
        </div>
    );
}
