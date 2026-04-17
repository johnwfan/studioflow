import Link from "next/link";
import { CalendarClock, CheckCheck, FolderKanban, Sparkles } from "lucide-react";

import Breadcrumbs from "@/components/breadcrumbs";
import EmptyState from "@/components/empty-state";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getTaskProgress(tasks: Array<{ completed: boolean }>) {
  if (tasks.length === 0) {
    return 0;
  }

  const completedTaskCount = tasks.filter((task) => task.completed).length;
  return Math.round((completedTaskCount / tasks.length) * 100);
}

export default async function DashboardPage() {
  const userId = await requireUserId();

  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        contentType: true,
        publishDate: true,
        createdAt: true,
        updatedAt: true,
        tasks: {
          select: {
            completed: true,
          },
        },
      },
    }),
    prisma.task.findMany({
      where: {
        project: { userId },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        text: true,
        completed: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
  ]);

  const totalProjects = projects.length;
  const ideaProjects = projects.filter((project) => project.status === "IDEA");
  const scheduledProjects = projects.filter(
    (project) => project.publishDate !== null,
  );
  const publishedProjects = projects.filter(
    (project) => project.status === "PUBLISHED",
  );

  const openTasks = tasks.filter((task) => !task.completed);
  const upcomingProjects = [...scheduledProjects]
    .sort((a, b) => {
      if (!a.publishDate || !b.publishDate) {
        return 0;
      }

      return a.publishDate.getTime() - b.publishDate.getTime();
    })
    .slice(0, 4);

  const recentProjects = [...projects]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  const taskPreview = openTasks.slice(0, 5);
  const averageProjectProgress =
    projects.length === 0
      ? 0
      : Math.round(
          projects.reduce((total, project) => {
            return total + getTaskProgress(project.tasks);
          }, 0) / projects.length,
        );

  const summaryCards = [
    {
      label: "Total Projects",
      value: totalProjects,
      description: "Everything currently in your workspace.",
    },
    {
      label: "Idea Stage",
      value: ideaProjects.length,
      description: "Projects that are still early concepts.",
    },
    {
      label: "Scheduled",
      value: scheduledProjects.length,
      description: "Projects with a publish date on the calendar.",
    },
    {
      label: "Published",
      value: publishedProjects.length,
      description: "Projects already marked as shipped.",
    },
  ];

  return (
    <div className="page-shell dashboard-page">
      <div className="page-shell__inner">
        <header className="page-header">
          <div className="page-header__content">
            <div className="page-header__body">
              <p className="page-header__eyebrow">Workspace Snapshot</p>
              <h1 className="page-header__title">Dashboard</h1>
              <p className="page-header__description">
                Track what is moving, what is blocked, and what is ready to ship next.
              </p>
            </div>

            <div className="page-header__actions">
              <Button asChild variant="outline" size="lg">
                <Link href="/projects">View projects</Link>
              </Button>
              <Button asChild size="lg">
                <Link href="/projects/new">New project</Link>
              </Button>
            </div>
          </div>
        </header>

        <Breadcrumbs items={[{ label: "Dashboard" }]} />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card, index) => (
            <article
              key={card.label}
              className={[
                "metric-card",
                "dashboard-static-card",
                index === 0 ? "sm:col-span-2 xl:col-span-2" : "",
              ].join(" ")}
            >
              <p className="metric-card__label">{card.label}</p>
              <p className="metric-card__value">{card.value}</p>
              <p className="metric-card__description">{card.description}</p>
            </article>
          ))}
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="page-section dashboard-static-card">
            <div className="page-section__header">
              <div>
                <p className="page-section__eyebrow">Next Up</p>
                <h2 className="page-section__title">Upcoming Schedule</h2>
              </div>

              <Button asChild variant="ghost">
                <Link href="/calendar">View calendar</Link>
              </Button>
            </div>

            {upcomingProjects.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  icon={CalendarClock}
                  title="Let's create something"
                  description="Projects with a publish date will show up here in chronological order."
                  actionHref="/projects/new"
                  actionLabel="Plan a project"
                  actionIcon={FolderKanban}
                />
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {upcomingProjects.map((project) => {
                  const taskProgress = getTaskProgress(project.tasks);

                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="list-card block"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-foreground">
                            {project.title}
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <StatusBadge status={project.status} />
                            <span className="chip">
                              {formatEnumLabel(project.contentType)}
                            </span>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                              <span>Task progress</span>
                              <span>{taskProgress}%</span>
                            </div>
                            <div className="progress-track">
                              <div
                                className="progress-bar"
                                style={{ width: `${taskProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-sm text-muted-foreground md:text-right">
                          <p className="font-medium text-foreground">
                            {project.publishDate
                              ? formatDateTime(project.publishDate)
                              : "Not scheduled"}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                            Publish date
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="page-section dashboard-static-card">
            <div className="page-section__header">
              <div>
                <p className="page-section__eyebrow">Tasks</p>
                <h2 className="page-section__title">Open Task Overview</h2>
              </div>
              <p className="text-sm text-muted-foreground">{openTasks.length} open</p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-1">
              <article className="surface-subtle">
                <p className="text-sm font-medium text-muted-foreground">Open tasks</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  {openTasks.length}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Active next steps still waiting to be finished.
                </p>
              </article>

              <article className="surface-subtle">
                <p className="text-sm font-medium text-muted-foreground">Avg. progress</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  {averageProjectProgress}%
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Average task completion across your projects.
                </p>
              </article>
            </div>

            {taskPreview.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  icon={CheckCheck}
                  title="All caught up!"
                  description="Once you add tasks to projects, the most recent open items will show up here."
                />
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {taskPreview.map((task) => (
                  <Link
                    key={task.id}
                    href={`/projects/${task.project.id}`}
                    className="list-card block"
                  >
                    <p className="text-sm font-semibold text-foreground">{task.text}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                      {task.project.title}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="page-section dashboard-static-card">
          <div className="page-section__header">
            <div>
              <p className="page-section__eyebrow">Activity</p>
              <h2 className="page-section__title">Recent Projects</h2>
            </div>
          </div>

          {recentProjects.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={Sparkles}
                title="Let's create something"
                description="Your recently updated work will appear here once projects start moving through the pipeline."
                actionHref="/projects/new"
                actionLabel="Create a project"
                actionIcon={FolderKanban}
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              {recentProjects.map((project) => {
                const taskProgress = getTaskProgress(project.tasks);

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="list-card block"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-foreground">
                          {project.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <StatusBadge status={project.status} />
                          <span className="chip">{formatEnumLabel(project.contentType)}</span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(project.updatedAt)}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                          Updated
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                        <span>Task progress</span>
                        <span>{taskProgress}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-bar"
                          style={{ width: `${taskProgress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
