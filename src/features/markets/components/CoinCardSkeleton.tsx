import { Skeleton } from "@/components/ui/skeleton"

export default function CoinCardSkeleton() {
  return (
    <div className="p-4 border border-border rounded-xl bg-card shadow-sm flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />

      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>

      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-20 ml-auto" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
    </div>
  )
}