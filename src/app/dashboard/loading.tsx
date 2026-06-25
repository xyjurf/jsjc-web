export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-28 rounded bg-bg-elevated" />
        <div className="mt-1 h-4 w-48 rounded bg-bg-elevated" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-bg-card p-5">
            <div className="h-4 w-16 rounded bg-bg-elevated" />
            <div className="mt-2 h-8 w-24 rounded bg-bg-elevated" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-bg-card p-6">
        <div className="h-6 w-32 rounded bg-bg-elevated" />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-12 rounded bg-bg-elevated" />
              <div className="mt-1 h-5 w-20 rounded bg-bg-elevated" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}