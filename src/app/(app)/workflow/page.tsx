import Link from "next/link";

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
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Production Pipeline
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                Workflow Board
              </h1>
              <p className="mt-3 text-sm leading-7 text-zinc-600 sm:text-base">
                A calm, kanban-style view of your creator pipeline so you can
                see what is still an idea, what is in production, and what is
                already scheduled or shipped.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/projects"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                View Projects
              </Link>
              <Link
                href="/projects/new"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                New Project
              </Link>
            </div>
          </div>
        </header>

        <section className="overflow-x-auto pb-2">
          <div className="grid min-w-[1100px] gap-5 xl:grid-cols-6">
            {columns.map((column) => (
              <section
                key={column.key}
                className="flex min-h-[32rem] flex-col rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="border-b border-zinc-200 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-zinc-950">
                      {column.label}
                    </h2>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                      {column.projects.length}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {column.description}
                  </p>
                </div>

                {column.projects.length === 0 ? (
                  <div className="mt-5 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-center">
                    <p className="text-sm leading-6 text-zinc-500">
                      No projects in {column.label.toLowerCase()} right now.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {column.projects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="block rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold leading-6 text-zinc-950">
                            {project.title}
                          </h3>
                          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-zinc-200">
                            {formatContentType(project.contentType)}
                          </span>
                        </div>

                        {project.description ? (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
                            {project.description}
                          </p>
                        ) : (
                          <p className="mt-3 text-sm leading-6 text-zinc-400">
                            No description yet.
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-zinc-500">
                          <span>{column.label}</span>
                          <span>
                            {formatDate(project.publishDate) ?? "No publish date"}
                          </span>
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
