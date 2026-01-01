import { Skeleton } from "@/components/ui/skeleton"

export default function CoinCardSkeleton() {
  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full bg-slate-200" />
      
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-[100px] bg-slate-200" />
        <Skeleton className="h-4 w-[60px] bg-slate-200" />
      </div>

      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-[80px] ml-auto bg-slate-200" />
        <Skeleton className="h-3 w-[40px] ml-auto bg-slate-200" />
      </div>
    </div>
  )
}