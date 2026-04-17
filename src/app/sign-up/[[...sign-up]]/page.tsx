import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Get started
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Create your studioflow account
            </h1>
            <p className="mt-4 text-sm leading-7 text-zinc-600 sm:text-base">
              Set up a clean workspace for ideas, production planning, tasks,
              scheduling, and everything you need to ship content consistently.
            </p>
          </section>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <SignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
              fallbackRedirectUrl="/dashboard"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
