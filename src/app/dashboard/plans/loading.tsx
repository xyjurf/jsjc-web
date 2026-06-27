import { SkeletonCard } from "@/components/Skeleton";

export default function PlansLoading() {
  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <div className="mb-2 h-7 w-48 rounded" />
        <div className="mb-6 h-4 w-64 rounded" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}