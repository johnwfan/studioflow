import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const workflowStages = [
  {
    key: "IDEA",
    label: "Idea",
    description: "Early concepts and rough content directions.",
  },
  {
    key: "SCRIPTING",
    label: "Scripting",
    description: "Projects being outlined, scripted, or structured.",
  },
  {
    key: "FILMING",
    label: "Filming",
    description: "Content currently being recorded or captured.",
  },
  {
    key: "EDITING",
    label: "Editing",
    description: "Projects in post-production and refinement.",
  },
  {
    key: "SCHEDULED",
    label: "Scheduled",
    description: "Content with a publish plan already locked in.",
  },
  {
    key: "PUBLISHED",
    label: "Published",
    description: "Completed projects that have already gone live.",
  },
] as const;

function formatContentType(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(date: Date | null) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export default async function WorkflowPage() {
  const userId = await requireUserId();

  const projects = await prisma.project.findMany({
    where: {
      userId,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      contentType: true,
      publishDate: true,
    },
  });

  const columns = workflowStages.map((stage) => ({
    ...stage,
    projects: projects.filter((project) => project.status === stage.key),
  }));

  return (
    <div className="page-shell">
      <div className="page-shell__inner page-shell__inner--wide">
        <header className="page-header">
          <div className="page-header__content">
            <div className="page-header__body">
              <p className="page-header__eyebrow">Production Pipeline</p>
              <h1 className="page-header__title">Workflow Board</h1>
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

        <section>
          <div className="overflow-x-auto pb-3">
            <div className="flex min-w-max gap-5 pr-6">
            {columns.map((column) => (
              <section
                key={column.key}
                className="flex min-h-[34rem] w-[300px] flex-none flex-col rounded-[1.75rem] border border-border/80 bg-card/75 p-5"
              >
                <div className="border-b border-border/80 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Stage
                      </p>
                      <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                      {column.label}
                      </h2>
                    </div>
                    <span className="chip">{column.projects.length}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {column.description}
                  </p>
                </div>

                {column.projects.length === 0 ? (
                  <div className="surface-empty mt-5 flex flex-1 items-center justify-center">
                    <div>
                      <h3 className="surface-empty__title">
                        Nothing here yet
                      </h3>
                      <p className="surface-empty__description">
                        No projects in {column.label.toLowerCase()} right now.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {column.projects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="list-card block min-h-[11.5rem]"
                      >
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold leading-6 text-foreground">
                            {project.title}
                          </h3>
                        </div>

                        {project.description ? (
                          <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">
                            {project.description}
                          </p>
                        ) : (
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            No description yet.
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          <span className="chip">{formatContentType(project.contentType)}</span>
                          {project.publishDate ? (
                            <span className="chip">{formatDate(project.publishDate)}</span>
                          ) : null}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          <span>{column.label}</span>
                          <span>{project.publishDate ? "Scheduled" : "Unscheduled"}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
