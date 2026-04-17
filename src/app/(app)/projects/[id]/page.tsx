import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Link2, ListTodo, PenSquare } from "lucide-react";

import Breadcrumbs from "@/components/breadcrumbs";
import EmptyState from "@/components/empty-state";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import SubmitButton from "@/components/ui/submit-button";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ProjectDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    created?: string;
    updated?: string;
  }>;
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getLinkHostname(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function getTaskProgress(tasks: Array<{ completed: boolean }>) {
  if (tasks.length === 0) {
    return 0;
  }

  const completedTaskCount = tasks.filter((task) => task.completed).length;
  return Math.round((completedTaskCount / tasks.length) * 100);
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const userId = await requireUserId();

  const project = await prisma.project.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      tasks: {
        orderBy: {
          createdAt: "asc",
        },
      },
      assetLinks: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  async function createTask(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();
    const text = formData.get("text");
    const trimmedText = typeof text === "string" ? text.trim() : "";

    if (!trimmedText) {
      return;
    }

    const ownedProject = await prisma.project.findFirst({
      where: {
        id,
        userId: currentUserId,
      },
      select: {
        id: true,
      },
    });

    if (!ownedProject) {
      notFound();
    }

    await prisma.task.create({
      data: {
        text: trimmedText,
        projectId: ownedProject.id,
      },
    });

    revalidatePath(`/projects/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/projects");
  }

  async function toggleTaskCompletion(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();
    const taskId = formData.get("taskId");
    const completed = formData.get("completed");

    if (typeof taskId !== "string" || typeof completed !== "string") {
      return;
    }

    const ownedTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          id,
          userId: currentUserId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!ownedTask) {
      notFound();
    }

    await prisma.task.update({
      where: {
        id: ownedTask.id,
      },
      data: {
        completed: completed === "true",
      },
    });

    revalidatePath(`/projects/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/projects");
  }

  async function deleteTask(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();
    const taskId = formData.get("taskId");

    if (typeof taskId !== "string") {
      return;
    }

    const ownedTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          id,
          userId: currentUserId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!ownedTask) {
      notFound();
    }

    await prisma.task.delete({
      where: {
        id: ownedTask.id,
      },
    });

    revalidatePath(`/projects/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/projects");
  }

  async function createAssetLink(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();
    const label = formData.get("label");
    const url = formData.get("url");

    const trimmedLabel = typeof label === "string" ? label.trim() : "";
    const trimmedUrl = typeof url === "string" ? url.trim() : "";

    if (!trimmedLabel || !trimmedUrl) {
      return;
    }

    const ownedProject = await prisma.project.findFirst({
      where: {
        id,
        userId: currentUserId,
      },
      select: {
        id: true,
      },
    });

    if (!ownedProject) {
      notFound();
    }

    await prisma.assetLink.create({
      data: {
        label: trimmedLabel,
        url: trimmedUrl,
        projectId: ownedProject.id,
      },
    });

    revalidatePath(`/projects/${id}`);
  }

  async function deleteAssetLink(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();
    const assetLinkId = formData.get("assetLinkId");

    if (typeof assetLinkId !== "string") {
      return;
    }

    const ownedAssetLink = await prisma.assetLink.findFirst({
      where: {
        id: assetLinkId,
        project: {
          id,
          userId: currentUserId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!ownedAssetLink) {
      notFound();
    }

    await prisma.assetLink.delete({
      where: {
        id: ownedAssetLink.id,
      },
    });

    revalidatePath(`/projects/${id}`);
  }

  const completedTaskCount = project.tasks.filter((task) => task.completed).length;
  const openTaskCount = project.tasks.length - completedTaskCount;
  const taskProgress = getTaskProgress(project.tasks);

  return (
    <div className="page-shell">
      <div className="page-shell__inner">
        <header className="page-header">
          <div className="page-header__content">
            <div className="page-header__body">
              <p className="page-header__eyebrow">Project Workspace</p>
              <h1 className="page-header__title">{project.title}</h1>

              <div className="page-header__meta">
                <StatusBadge status={project.status} />
                <span className="chip">{formatEnumLabel(project.contentType)}</span>
                <span className="chip">
                  {openTaskCount} open {openTaskCount === 1 ? "task" : "tasks"}
                </span>
                <span className="chip">{taskProgress}% complete</span>
              </div>
            </div>

            <div className="page-header__actions">
              <Button asChild variant="outline" size="lg">
                <Link href="/projects">Back to projects</Link>
              </Button>
              <Button asChild size="lg">
                <Link href={`/projects/${project.id}/edit`}>Edit project</Link>
              </Button>
            </div>
          </div>

          {resolvedSearchParams?.created === "1" ? (
            <div className="surface-subtle mt-6">
              <p className="text-sm font-medium text-foreground">
                Project created successfully.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                This is a good place to add the first tasks, notes, or reference links.
              </p>
            </div>
          ) : null}

          {resolvedSearchParams?.updated === "1" ? (
            <div className="surface-subtle mt-6">
              <p className="text-sm font-medium text-foreground">
                Project updated successfully.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                The latest details are now reflected across dashboard, workflow, and calendar views.
              </p>
            </div>
          ) : null}
        </header>

        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Projects", href: "/projects" },
            { label: project.title },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-6">
            <section className="page-section">
              <div className="page-section__header">
                <div>
                  <p className="page-section__eyebrow">Overview</p>
                  <h2 className="page-section__title">Content and notes</h2>
                </div>
                <span className="chip">{formatEnumLabel(project.contentType)}</span>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
                    {project.description || "No description has been added yet."}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
                    {project.notes || "No notes yet."}
                  </p>
                </div>
              </div>
            </section>

            <section className="page-section">
              <div className="page-section__header">
                <div>
                  <p className="page-section__eyebrow">Tasks</p>
                  <h2 className="page-section__title">Task list</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {completedTaskCount} completed • {openTaskCount} open • {taskProgress}% done
                </p>
              </div>

              <div className="mt-5">
                <div className="progress-track">
                  <div
                    className="progress-bar"
                    style={{ width: `${taskProgress}%` }}
                  />
                </div>
              </div>

              <form action={createTask} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  name="text"
                  type="text"
                  required
                  placeholder="Add a task like finish thumbnail or review script"
                  className="ui-input flex-1"
                />
                <SubmitButton size="lg" pendingLabel="Adding task...">
                  Add task
                </SubmitButton>
              </form>

              {project.tasks.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    icon={ListTodo}
                    title="No tasks yet"
                    description="Add a few small next steps so this project feels actionable."
                    actionHref={`/projects/${project.id}/edit`}
                    actionLabel="Refine project"
                    actionIcon={PenSquare}
                  />
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {project.tasks.map((task) => (
                    <article key={task.id} className="surface-subtle">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p
                            className={[
                              "text-sm font-medium",
                              task.completed
                                ? "text-muted-foreground line-through"
                                : "text-foreground",
                            ].join(" ")}
                          >
                            {task.text}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                            {task.completed ? "Completed" : "Open"}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <form action={toggleTaskCompletion}>
                            <input type="hidden" name="taskId" value={task.id} />
                            <input
                              type="hidden"
                              name="completed"
                              value={task.completed ? "false" : "true"}
                            />
                            <SubmitButton
                              variant={task.completed ? "outline" : "default"}
                              size="sm"
                              pendingLabel="Saving..."
                            >
                              {task.completed ? "Mark open" : "Mark complete"}
                            </SubmitButton>
                          </form>

                          <form action={deleteTask}>
                            <input type="hidden" name="taskId" value={task.id} />
                            <SubmitButton
                              variant="ghost"
                              size="sm"
                              pendingLabel="Removing..."
                            >
                              Delete
                            </SubmitButton>
                          </form>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="page-section">
              <div className="page-section__header">
                <div>
                  <p className="page-section__eyebrow">Asset Links</p>
                  <h2 className="page-section__title">References and resources</h2>
                </div>
              </div>

              <form
                action={createAssetLink}
                className="mt-6 grid gap-3 md:grid-cols-[0.9fr_1.3fr_auto]"
              >
                <input
                  name="label"
                  type="text"
                  required
                  placeholder="Thumbnail reference"
                  className="ui-input"
                />
                <input
                  name="url"
                  type="url"
                  required
                  placeholder="https://..."
                  className="ui-input"
                />
                <SubmitButton size="lg" pendingLabel="Adding link...">
                  Add link
                </SubmitButton>
              </form>

              {project.assetLinks.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    icon={Link2}
                    title="No asset links yet"
                    description="Save useful docs, references, scripts, or inspiration links here."
                  />
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {project.assetLinks.map((assetLink) => (
                    <div key={assetLink.id} className="surface-subtle">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <a
                          href={assetLink.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block min-w-0 flex-1 transition hover:text-foreground"
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {assetLink.label}
                          </p>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {assetLink.url}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                            {getLinkHostname(assetLink.url)}
                          </p>
                        </a>

                        <form action={deleteAssetLink}>
                          <input
                            type="hidden"
                            name="assetLinkId"
                            value={assetLink.id}
                          />
                          <SubmitButton
                            variant="ghost"
                            size="sm"
                            pendingLabel="Removing..."
                          >
                            Delete
                          </SubmitButton>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <aside className="page-section">
              <div className="page-section__header">
                <div>
                  <p className="page-section__eyebrow">Metadata</p>
                  <h2 className="page-section__title">Project details</h2>
                </div>
              </div>

              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {formatEnumLabel(project.status)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Content type
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {formatEnumLabel(project.contentType)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Publish date
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {formatDate(project.publishDate)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Task progress
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {taskProgress}% complete
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Created at
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {formatDateTime(project.createdAt)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Updated at
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {formatDateTime(project.updatedAt)}
                  </dd>
                </div>
              </dl>
            </aside>

            <aside className="page-section">
              <p className="page-section__eyebrow">Danger Zone</p>
              <h2 className="page-section__title">Delete project</h2>
              <p className="page-section__description">
                Delete this project from your workspace using a confirmation step
                before anything is removed.
              </p>

              <div className="danger-panel mt-6">
                <p className="text-sm font-semibold">Deletion is permanent.</p>
                <p className="mt-2 text-sm leading-6">
                  If you are unsure, keep the project and update its status instead.
                </p>
              </div>

              <div className="mt-6">
                <Button asChild variant="destructive" size="lg">
                  <Link href={`/projects/${project.id}/delete`}>Delete project</Link>
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
