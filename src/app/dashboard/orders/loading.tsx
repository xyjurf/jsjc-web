import { SkeletonTable } from "@/components/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="h-7 w-28 rounded" />
      <SkeletonTable rows={5} cols={6} />
    </div>
  );
}