import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium tracking-wide text-muted-foreground">
            creator workflow platform
          </p>

          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            turn ideas into
            <span className="block">shipped content</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Studioflow helps creators organize ideas, manage production,
            schedule content, and keep their entire workflow in one place.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-foreground px-6 text-sm font-medium text-background transition hover:opacity-90"
            >
              Enter app
            </Link>

            <Link
              href="/projects"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-6 text-sm font-medium transition hover:bg-muted"
            >
              View workspace
            </Link>
          </div>
        </div>

        <div className="mt-20 w-full max-w-5xl">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-6 text-left">
              <h2 className="text-base font-semibold">capture ideas</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Keep content ideas, concepts, and notes together instead of
                scattered across apps.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 text-left">
              <h2 className="text-base font-semibold">manage workflow</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Move projects through scripting, filming, editing, scheduling,
                and publishing.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 text-left">
              <h2 className="text-base font-semibold">stay on schedule</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                See deadlines and publish plans clearly with one organized
                creator workspace.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 