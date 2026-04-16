import Link from "next/link";

import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusOptions = [
  "IDEA",
  "SCRIPTING",
  "FILMING",
  "EDITING",
  "SCHEDULED",
  "PUBLISHED",
] as const;

const contentTypeOptions = [
  "YOUTUBE",
  "SHORT_FORM",
  "STREAM",
  "POST",
  "PODCAST",
  "OTHER",
] as const;

type ProjectsPageProps = {
  searchParams?: Promise<{
    status?: string;
    contentType?: string;
  }>;
};

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

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const userId = await requireUserId();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedStatus =
    typeof resolvedSearchParams?.status === "string"
      ? resolvedSearchParams.status
      : "";
  const selectedContentType =
    typeof resolvedSearchParams?.contentType === "string"
      ? resolvedSearchParams.contentType
      : "";

  const projects = await prisma.project.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tasks: {
        select: {
          completed: true,
        },
      },
    },
  });

  const filteredProjects = projects.filter((project) => {
    const matchesStatus = selectedStatus ? project.status === selectedStatus : true;
    const matchesContentType = selectedContentType
      ? project.contentType === selectedContentType
      : true;

    return matchesStatus && matchesContentType;
  });

  return (
    <div className="projects-page">
      <div className="projects-page__container">
        <div className="projects-page__header">
          <div>
            <p className="projects-page__eyebrow">
              workspace
            </p>
            <h1 className="projects-page__title">
              Projects
            </h1>
            <p className="projects-page__description">
              Manage your content pipeline from idea to published work.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="projects-page__count">
              {filteredProjects.length}{" "}
              {filteredProjects.length === 1 ? "project" : "projects"}
            </div>

            <Link
              href="/projects/new"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              New Project
            </Link>
          </div>
        </div>

        <section className="mb-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
                Filters
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Narrow the workspace by production stage or content type.
              </p>
            </div>

            <form method="get" className="grid gap-3 sm:grid-cols-3">
              <select
                name="status"
                defaultValue={selectedStatus}
                className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              >
                <option value="">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatEnumLabel(status)}
                  </option>
                ))}
              </select>

              <select
                name="contentType"
                defaultValue={selectedContentType}
                className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              >
                <option value="">All content types</option>
                {contentTypeOptions.map((contentType) => (
                  <option key={contentType} value={contentType}>
                    {formatEnumLabel(contentType)}
                  </option>
                ))}
              </select>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  Apply
                </button>
                <Link
                  href="/projects"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                >
                  Reset
                </Link>
              </div>
            </form>
          </div>
        </section>

        {filteredProjects.length === 0 ? (
          <div className="projects-page__empty">
            <h2 className="projects-page__empty-title">No matching projects</h2>
            <p className="projects-page__empty-description">
              Try a different filter combination, or create a new project to
              start filling the workspace.
            </p>
          </div>
        ) : (
          <div className="projects-page__grid">
            {filteredProjects.map((project) => {
              const taskProgress = getTaskProgress(project.tasks);
              const completedTaskCount = project.tasks.filter(
                (task) => task.completed,
              ).length;

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block rounded-[inherit] transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                >
                  <article className="project-card">
                    <div className="project-card__header">
                      <div>
                        <h2 className="project-card__title">
                          {project.title}
                        </h2>
                        <p className="project-card__type">
                          {formatEnumLabel(project.contentType)}
                        </p>
                      </div>

                      <span className="project-card__status">
                        {project.status.toLowerCase()}
                      </span>
                    </div>

                    <p className="project-card__description">
                      {project.description || "No description yet."}
                    </p>

                    <div className="mt-5">
                      <div className="flex items-center justify-between gap-3 text-sm text-zinc-600">
                        <span>Task progress</span>
                        <span>
                          {taskProgress}% • {completedTaskCount}/{project.tasks.length}
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-zinc-200">
                        <div
                          className="h-2 rounded-full bg-zinc-900 transition-all"
                          style={{ width: `${taskProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="project-card__meta">
                      <div className="project-card__meta-row">
                        <span className="project-card__meta-label">Created</span>
                        <span className="project-card__meta-value">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="project-card__meta-row">
                        <span className="project-card__meta-label">
                          Publish date
                        </span>
                        <span className="project-card__meta-value">
                          {project.publishDate
                            ? new Date(project.publishDate).toLocaleDateString()
                            : "Not scheduled"}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
