import { Skeleton } from "@/components/ui/skeleton"

export default function CoinCardSkeleton() {
  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full bg-slate-200" />

      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-25 bg-slate-200" />
        <Skeleton className="h-4 w-15 bg-slate-200" />
      </div>

      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-20 ml-auto bg-slate-200" />
        <Skeleton className="h-3 w-10 ml-auto bg-slate-200" />
      </div>
    </div>
  )
}