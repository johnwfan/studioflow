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
              <p className="page-header__description">
                A calm, kanban-style view of your creator pipeline so you can
                see what is still an idea, what is in production, and what is
                already scheduled or shipped.
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

        <section className="overflow-x-auto pb-2">
          <div className="grid min-w-[1100px] gap-5 xl:grid-cols-6">
            {columns.map((column) => (
              <section
                key={column.key}
                className="flex min-h-[32rem] flex-col rounded-4xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <div className="border-b border-border pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-foreground">
                      {column.label}
                    </h2>
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
                        className="list-card block"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold leading-6 text-foreground">
                            {project.title}
                          </h3>
                          <span className="chip shrink-0">
                            {formatContentType(project.contentType)}
                          </span>
                        </div>

                        {project.description ? (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                            {project.description}
                          </p>
                        ) : (
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            No description yet.
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                          <span>{column.label}</span>
                          <span>{formatDate(project.publishDate) ?? "No publish date"}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
