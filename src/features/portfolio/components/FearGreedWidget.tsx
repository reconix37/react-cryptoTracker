import { Card, CardContent } from "@/components/ui/card";
import { useFearGreed } from "@/features/auth/hooks/useFearGreed";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertCircleIcon } from "lucide-react";
import { Alert, AlertTitle } from "../../../components/ui/alert";

export default function FearGreedWidget() {
    const { data, isLoading, error } = useFearGreed();

    if (isLoading) {
        return (
            <Card className="bg-card/50 border-none animate-pulse">
                <CardContent className="p-4 h-22 flex items-center justify-center">
                    <div className="h-4 w-full bg-muted rounded" />
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Alert variant="destructive" className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertCircleIcon className="h-5 w-5" />
                    <div>
                        <AlertTitle className="font-bold">Failed to load sentiment"</AlertTitle>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            </Alert>
        )
    };

    return (
        <Card className="bg-card shadow-sm border overflow-hidden hover:bg-muted/30 transition-colors">
            <CardContent className="px-3 py-1">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                        Market Sentiment
                    </span>
                    <AlertCircle className={cn("h-3 w-3", data.color)} />
                </div>
                <div className="flex items-end gap-3">
                    <span className={cn("text-3xl font-black leading-none", data.color)}>
                        {data.value}
                    </span>

                    <div className="flex flex-col grow">
                        <span className={cn("text-[11px] font-black uppercase tracking-tight", data.color)}>
                            {data.label}
                        </span>

                        <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                            <div
                                className={cn("h-full transition-all duration-1000 ease-out")}
                                style={{
                                    width: `${data.value}%`,
                                    backgroundColor: 'currentColor'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}