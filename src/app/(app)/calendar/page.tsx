import Link from "next/link";
import { CalendarPlus2, Clock3 } from "lucide-react";

import Breadcrumbs from "@/components/breadcrumbs";
import CalendarExperience from "@/components/calendar/calendar-experience";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      description: true,
      publishDate: true,
    },
  });

  return (
    <div className="page-shell">
      <div className="page-shell__inner">
        <header className="page-header">
          <div className="page-header__content">
            <div className="page-header__body">
              <p className="page-header__eyebrow">Publishing Schedule</p>
              <h1 className="page-header__title">Calendar</h1>
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

        {scheduledProjects.length === 0 ? (
          <EmptyState
            icon={Clock3}
            title="No scheduled projects yet"
            description="Projects with a publish date will appear here in chronological order."
            actionHref="/projects/new"
            actionLabel="Create a scheduled project"
            actionIcon={CalendarPlus2}
          />
        ) : (
          <CalendarExperience
            projects={scheduledProjects
              .filter(
                (project): project is typeof project & { publishDate: Date } =>
                  project.publishDate !== null,
              )
              .map((project) => ({
                ...project,
                publishDate: project.publishDate.toISOString(),
              }))}
          />
        )}
      </div>
    </div>
  );
}
