import Link from "next/link";

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

export default async function DashboardPage() {
  const projects = await prisma.project.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      status: true,
      contentType: true,
      publishDate: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const totalProjects = projects.length;
  const ideaProjects = projects.filter((project) => project.status === "IDEA");
  const scheduledProjects = projects.filter(
    (project) => project.publishDate !== null,
  );
  const publishedProjects = projects.filter(
    (project) => project.status === "PUBLISHED",
  );

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
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Workspace Snapshot
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
            A quick view of your pipeline so you can see how much is in motion,
            what is scheduled next, and which projects were updated recently.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              key={card.label}
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-zinc-500">{card.label}</p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
                {card.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {card.description}
              </p>
            </article>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Next Up
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
                  Upcoming
                </h2>
              </div>

              <Link
                href="/calendar"
                className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
              >
                View calendar
              </Link>
            </div>

            {upcomingProjects.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6">
                <h3 className="text-base font-semibold text-zinc-950">
                  Nothing is scheduled yet
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Projects with a publish date will show up here in
                  chronological order.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {upcomingProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-zinc-950">
                          {project.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700">
                            {formatEnumLabel(project.status)}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
                            {formatEnumLabel(project.contentType)}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-sm text-zinc-600 md:text-right">
                        <p className="font-medium text-zinc-900">
                          {project.publishDate
                            ? formatDateTime(project.publishDate)
                            : "Not scheduled"}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
                          Publish date
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Activity
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
                Recent Projects
              </h2>
            </div>

            {recentProjects.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6">
                <h3 className="text-base font-semibold text-zinc-950">
                  No projects yet
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Your most recently updated projects will appear here once you
                  start creating work.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-zinc-950">
                          {project.title}
                        </h3>
                        <p className="mt-2 text-xs uppercase tracking-wide text-zinc-500">
                          {formatEnumLabel(project.status)} •{" "}
                          {formatEnumLabel(project.contentType)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-medium text-zinc-900">
                          {formatDate(project.updatedAt)}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
                          Updated
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
