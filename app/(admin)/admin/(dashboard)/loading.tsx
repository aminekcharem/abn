export default function AdminDashboardLoading() {
  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-md bg-zinc-800" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-zinc-800/80" />
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row">
          <div className="h-10 w-full animate-pulse rounded-md bg-zinc-800 sm:max-w-sm" />
          <div className="h-10 w-40 animate-pulse rounded-md bg-zinc-800" />
        </div>
        <div className="overflow-hidden rounded-md border border-zinc-800">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              className="grid grid-cols-[80px_1fr_120px_120px] gap-4 border-b border-zinc-800 p-4 last:border-b-0"
              key={index}
            >
              <div className="h-12 animate-pulse rounded-md bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded-md bg-zinc-800" />
                <div className="h-3 w-1/2 animate-pulse rounded-md bg-zinc-800/80" />
              </div>
              <div className="h-4 animate-pulse rounded-md bg-zinc-800" />
              <div className="h-4 animate-pulse rounded-md bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
