import Skeleton, { SkeletonStat } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Skeleton className="mb-2 h-7 w-28" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
      </div>

      <div className="rounded-2xl border border-border bg-bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-36" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-1 h-3 w-12" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
    </div>
  );
}