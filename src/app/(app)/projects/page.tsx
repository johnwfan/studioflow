import Link from "next/link";

import { Button } from "@/components/ui/button";
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
    created?: string;
    deleted?: string;
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
    where: { userId },
    orderBy: { createdAt: "desc" },
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
    <div className="page-shell">
      <div className="page-shell__inner">
        <header className="page-header">
          <div className="page-header__content">
            <div className="page-header__body">
              <p className="page-header__eyebrow">Workspace</p>
              <h1 className="page-header__title">Projects</h1>
            </div>

            <div className="page-header__actions">
              <div className="chip">
                {filteredProjects.length}{" "}
                {filteredProjects.length === 1 ? "project" : "projects"}
              </div>
              <Button asChild size="lg">
                <Link href="/projects/new">New project</Link>
              </Button>
            </div>
          </div>

          {resolvedSearchParams?.created === "1" ? (
            <div className="surface-subtle mt-6">
              <p className="text-sm font-medium text-foreground">
                Project created successfully.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                It is now part of your workspace and ready for tasks, notes, and links.
              </p>
            </div>
          ) : null}

          {resolvedSearchParams?.deleted === "1" ? (
            <div className="surface-subtle mt-6">
              <p className="text-sm font-medium text-foreground">
                Project deleted successfully.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                The workspace list has been refreshed so you can keep moving.
              </p>
            </div>
          ) : null}
        </header>

        <section className="page-section">
          <div className="page-section__header">
            <div>
              <p className="page-section__eyebrow">Filters</p>
              <h2 className="page-section__title">Refine your workspace</h2>
              <p className="page-section__description">
                Narrow the list by production stage or content type.
              </p>
            </div>
          </div>

          <form method="get" className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
            <select
              name="status"
              defaultValue={selectedStatus}
              className="ui-select"
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
              className="ui-select"
            >
              <option value="">All content types</option>
              {contentTypeOptions.map((contentType) => (
                <option key={contentType} value={contentType}>
                  {formatEnumLabel(contentType)}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg">
                Apply
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/projects">Reset</Link>
              </Button>
            </div>
          </form>
        </section>

        {filteredProjects.length === 0 ? (
          <section className="surface-empty">
            <h2 className="surface-empty__title">No matching projects yet</h2>
            <p className="surface-empty__description">
              Try a different filter combination, or create a new project to
              start filling the workspace.
            </p>
            <div className="mt-5">
              <Button asChild size="lg">
                <Link href="/projects/new">Create a project</Link>
              </Button>
            </div>
          </section>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => {
              const taskProgress = getTaskProgress(project.tasks);
              const completedTaskCount = project.tasks.filter(
                (task) => task.completed,
              ).length;

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="list-card block rounded-4xl"
                >
                  <article>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold tracking-tight text-foreground">
                          {project.title}
                        </h2>
                        <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                          {formatEnumLabel(project.contentType)}
                        </p>
                      </div>

                      <span className="chip">{formatEnumLabel(project.status)}</span>
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {project.description || "No description yet."}
                    </p>

                    <div className="mt-5">
                      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                        <span>Task progress</span>
                        <span>
                          {taskProgress}% • {completedTaskCount}/{project.tasks.length}
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-bar"
                          style={{ width: `${taskProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium text-foreground">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Publish date</span>
                        <span className="font-medium text-foreground">
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
