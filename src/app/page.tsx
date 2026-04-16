import { auth } from "@clerk/nextjs/server";
import { ArrowRight, CalendarDays, Columns3, FolderKanban, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const featureCards = [
  {
    title: "Capture ideas without losing momentum",
    description:
      "Start with a rough concept, keep the notes nearby, and turn it into a real production plan later.",
  },
  {
    title: "See your production pipeline clearly",
    description:
      "Track what is still an idea, what is in progress, and what is already lined up to publish.",
  },
  {
    title: "Keep the whole workspace calm",
    description:
      "Projects, tasks, and publishing plans stay in one place so the app feels like a home base instead of another inbox.",
  },
];

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <main className="landing-page">
      <section className="landing-page__section">
        <header className="landing-page__nav">
          <Link href="/" className="landing-page__brand">
            <span className="landing-page__brand-icon">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>
              <span className="landing-page__brand-name">Studioflow</span>
              <span className="landing-page__brand-subtitle">creator workflow</span>
            </span>
          </Link>

          <div className="landing-page__nav-actions">
            {userId ? (
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">Open workspace</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="lg">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button asChild size="lg">
                  <Link href="/sign-up">Create account</Link>
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="landing-page__hero">
          <div>
            <p className="landing-page__eyebrow">Creator workflow platform</p>

            <h1 className="landing-page__title">
              Turn scattered ideas into a calm,
              <span className="landing-page__title-line">shipped content system.</span>
            </h1>

            <p className="landing-page__description">
              Studioflow brings planning, production, and publishing into one
              minimal workspace so you can move from rough concept to live
              content with less friction and more clarity.
            </p>

            <div className="landing-page__actions">
              {userId ? (
                <>
                  <Link href="/dashboard" className="landing-page__primary-action">
                    Enter dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="/projects"
                    className="landing-page__secondary-action"
                  >
                    View projects
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/sign-up" className="landing-page__primary-action">
                    Start free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link href="/sign-in" className="landing-page__secondary-action">
                    Sign in
                  </Link>
                </>
              )}
            </div>

            <p className="landing-page__supporting-note">
              Built for creators who want a product-like workspace instead of a
              patchwork of docs, notes, and spreadsheets.
            </p>

            <div className="landing-page__features">
              <div className="landing-page__feature-grid">
                {featureCards.map((feature) => (
                  <article key={feature.title} className="landing-page__feature-card">
                    <h2 className="landing-page__feature-title">{feature.title}</h2>
                    <p className="landing-page__feature-description">
                      {feature.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="landing-page__preview">
            <div className="landing-page__preview-shell">
              <div className="landing-page__preview-header">
                <div>
                  <p className="text-sm font-semibold text-foreground">Workspace preview</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The transition into the app should feel immediate and focused.
                  </p>
                </div>
                <span className="landing-page__preview-pill">Live workflow</span>
              </div>

              <div className="landing-page__preview-grid">
                <div className="landing-page__preview-rail">
                  <div className="landing-page__preview-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <FolderKanban className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Projects</p>
                        <p className="text-sm text-muted-foreground">12 active items</p>
                      </div>
                    </div>
                  </div>

                  <div className="landing-page__preview-card mt-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                        <Columns3 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Workflow</p>
                        <p className="text-sm text-muted-foreground">
                          Idea to published in one board
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="landing-page__preview-card mt-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Calendar</p>
                        <p className="text-sm text-muted-foreground">
                          Publishing dates stay visible
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="landing-page__preview-main">
                  <div className="landing-page__preview-card">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Dashboard
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                      Work that feels organized before it feels busy.
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Keep priorities visible, upcoming deadlines close, and
                      next actions simple.
                    </p>

                    <div className="landing-page__preview-stats">
                      <div className="landing-page__preview-stat">
                        <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">8</p>
                      </div>
                      <div className="landing-page__preview-stat">
                        <p className="text-sm font-medium text-muted-foreground">Open tasks</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">23</p>
                      </div>
                      <div className="landing-page__preview-stat">
                        <p className="text-sm font-medium text-muted-foreground">Avg. progress</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">67%</p>
                      </div>
                    </div>
                  </div>

                  <div className="landing-page__preview-card mt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Upcoming publish</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Weekly studio vlog
                        </p>
                      </div>
                      <span className="chip">Apr 21</span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                        <span>Production progress</span>
                        <span>72%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-bar" style={{ width: "72%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
