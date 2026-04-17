import Link from "next/link";
import { CalendarPlus2, Clock3 } from "lucide-react";

import Breadcrumbs from "@/components/breadcrumbs";
import EmptyState from "@/components/empty-state";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
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
    <div className="page-shell">
      <div className="page-shell__inner">
        <header className="page-header">
          <div className="page-header__content">
            <div className="page-header__body">
              <p className="page-header__eyebrow">Publishing Schedule</p>
              <h1 className="page-header__title">Calendar</h1>
              <p className="page-header__description">
                Keep upcoming publish windows visible so planning stays realistic.
              </p>
            </div>

            <div className="page-header__actions">
              <Button asChild variant="outline" size="lg">
                <Link href="/projects">View projects</Link>
              </Button>
            </div>
          </div>
        </header>

        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Calendar" },
          ]}
        />

        {projectsByDay.length === 0 ? (
          <EmptyState
            icon={Clock3}
            title="No scheduled projects yet"
            description="Projects with a publish date will appear here in chronological order."
            actionHref="/projects/new"
            actionLabel="Create a scheduled project"
            actionIcon={CalendarPlus2}
          />
        ) : (
          <div className="space-y-6">
            {projectsByDay.map((group) => (
              <section key={group.dateKey} className="page-section">
                <div className="page-section__header border-b border-border pb-5">
                  <div>
                    <p className="page-section__eyebrow">Scheduled Day</p>
                    <h2 className="page-section__title">
                      {formatDateHeading(group.date)}
                    </h2>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {group.projects.length}{" "}
                    {group.projects.length === 1 ? "project" : "projects"}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {group.projects.map((project) => (
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
                        </div>

                        <div className="shrink-0 text-sm text-muted-foreground md:text-right">
                          <p className="font-medium text-foreground">
                            {project.publishDate
                              ? formatTime(project.publishDate)
                              : "Time TBD"}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
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
