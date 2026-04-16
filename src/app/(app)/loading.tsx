function LoadingCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-border bg-card p-6">
      <div className="h-3 w-24 rounded-full bg-secondary" />
      <div className="mt-4 h-7 w-40 rounded-full bg-secondary" />
      <div className="mt-3 h-4 w-full rounded-full bg-secondary" />
      <div className="mt-2 h-4 w-2/3 rounded-full bg-secondary" />
    </div>
  );
}

export default function AppLoading() {
  return (
    <div className="page-shell">
      <div className="page-shell__inner">
        <div className="animate-pulse rounded-4xl border border-border bg-card px-6 py-6 sm:px-8 sm:py-8">
          <div className="h-3 w-28 rounded-full bg-secondary" />
          <div className="mt-4 h-10 w-56 rounded-full bg-secondary" />
          <div className="mt-4 h-4 w-full max-w-2xl rounded-full bg-secondary" />
          <div className="mt-2 h-4 w-2/3 max-w-xl rounded-full bg-secondary" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <LoadingCard />
          <LoadingCard />
        </div>
      </div>
    </div>
  );
}
