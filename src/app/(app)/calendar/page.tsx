import Link from "next/link";

import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateHeading(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
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

export default async function CalendarPage() {
  const userId = await requireUserId();

  const scheduledProjects = await prisma.project.findMany({
    where: {
      userId,
      publishDate: {
        not: null,
      },
    },
    orderBy: {
      publishDate: "asc",
    },
    select: {
      id: true,
      title: true,
      status: true,
      contentType: true,
      publishDate: true,
    },
  });

  const projectsByDay = scheduledProjects.reduce<
    Array<{
      dateKey: string;
      date: Date;
      projects: typeof scheduledProjects;
    }>
  >((groups, project) => {
    const publishDate = project.publishDate;

    if (!publishDate) {
      return groups;
    }

    const dateKey = getDateKey(publishDate);
    const existingGroup = groups.find((group) => group.dateKey === dateKey);

    if (existingGroup) {
      existingGroup.projects.push(project);
      return groups;
    }

    groups.push({
      dateKey,
      date: publishDate,
      projects: [project],
    });

    return groups;
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Publishing Schedule
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Calendar
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
            A simple schedule view of upcoming content so you can see what is
            planned, when it goes live, and how your pipeline is lining up.
          </p>
        </header>

        {projectsByDay.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
              No scheduled projects yet
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              Projects with a publish date will appear here in chronological
              order.
            </p>
          </section>
        ) : (
          <div className="space-y-6">
            {projectsByDay.map((group) => (
              <section
                key={group.dateKey}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="flex flex-col gap-2 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Scheduled Day
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
                      {formatDateHeading(group.date)}
                    </h2>
                  </div>

                  <p className="text-sm text-zinc-500">
                    {group.projects.length}{" "}
                    {group.projects.length === 1 ? "project" : "projects"}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {group.projects.map((project) => (
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
                              ? formatTime(project.publishDate)
                              : "Time TBD"}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
                            Publish time
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
