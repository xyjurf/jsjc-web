import Skeleton, { SkeletonText } from "@/components/Skeleton";

export default function UsageLoading() {
  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <Skeleton className="mb-2 h-7 w-28" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="rounded-2xl border border-border bg-bg-card p-5 space-y-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-full rounded-full" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}