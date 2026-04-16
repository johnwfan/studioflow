import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ProjectDetailPageProps = {
  params: Promise<{
    id: string;
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
}: ProjectDetailPageProps) {
  const { id } = await params;
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
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Project Workspace
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                {project.title}
              </h1>
              <p className="mt-4 text-sm leading-7 text-zinc-600 sm:text-base">
                {project.description || "No description has been added yet."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white">
                  {formatEnumLabel(project.status)}
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                  {formatEnumLabel(project.contentType)}
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                  {openTaskCount} open {openTaskCount === 1 ? "task" : "tasks"}
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                  {taskProgress}% complete
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/projects"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Back to projects
              </Link>
              <Link
                href={`/projects/${project.id}/edit`}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Edit Project
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Overview
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">
                    Content and notes
                  </h2>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-zinc-600">
                  {formatEnumLabel(project.contentType)}
                </span>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-zinc-500">Description</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-700 sm:text-base">
                    {project.description || "No description has been added yet."}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-zinc-500">Notes</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-700 sm:text-base">
                    {project.notes || "No notes yet."}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Tasks
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">
                    Task list
                  </h2>
                </div>

                <p className="text-sm text-zinc-500">
                  {completedTaskCount} completed • {openTaskCount} open • {taskProgress}% done
                </p>
              </div>

              <div className="mt-5 h-2 rounded-full bg-zinc-100">
                <div
                  className="h-2 rounded-full bg-zinc-900 transition-all"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>

              <form action={createTask} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  name="text"
                  type="text"
                  required
                  placeholder="Add a task like finish thumbnail or review script"
                  className="flex-1 rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  Add Task
                </button>
              </form>

              {project.tasks.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6">
                  <h3 className="text-base font-semibold text-zinc-950">
                    No tasks yet
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Add a few small next steps so this project feels actionable.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {project.tasks.map((task) => (
                    <article
                      key={task.id}
                      className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p
                            className={[
                              "text-sm font-medium",
                              task.completed
                                ? "text-zinc-500 line-through"
                                : "text-zinc-900",
                            ].join(" ")}
                          >
                            {task.text}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
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
                            <button
                              type="submit"
                              className={[
                                "inline-flex h-10 items-center justify-center rounded-2xl px-4 text-sm font-medium transition",
                                task.completed
                                  ? "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                                  : "bg-zinc-900 text-white hover:bg-zinc-800",
                              ].join(" ")}
                            >
                              {task.completed ? "Mark open" : "Mark complete"}
                            </button>
                          </form>

                          <form action={deleteTask}>
                            <input type="hidden" name="taskId" value={task.id} />
                            <button
                              type="submit"
                              className="inline-flex h-10 items-center justify-center rounded-2xl border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Asset Links
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">
                  References and resources
                </h2>
              </div>

              <form action={createAssetLink} className="mt-6 grid gap-3 md:grid-cols-[0.9fr_1.3fr_auto]">
                <input
                  name="label"
                  type="text"
                  required
                  placeholder="Thumbnail reference"
                  className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                />
                <input
                  name="url"
                  type="url"
                  required
                  placeholder="https://..."
                  className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  Add Link
                </button>
              </form>

              {project.assetLinks.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6">
                  <h3 className="text-base font-semibold text-zinc-950">
                    No asset links yet
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Save useful docs, references, scripts, or inspiration links
                    here.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {project.assetLinks.map((assetLink) => (
                    <div
                      key={assetLink.id}
                      className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <a
                          href={assetLink.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block min-w-0 flex-1 transition hover:text-zinc-950"
                        >
                          <p className="text-sm font-semibold text-zinc-950">
                            {assetLink.label}
                          </p>
                          <p className="mt-1 truncate text-sm text-zinc-600">
                            {assetLink.url}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-wide text-zinc-500">
                            {getLinkHostname(assetLink.url)}
                          </p>
                        </a>

                        <form action={deleteAssetLink}>
                          <input
                            type="hidden"
                            name="assetLinkId"
                            value={assetLink.id}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-10 items-center justify-center rounded-2xl border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <aside className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-950">Metadata</h2>

              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Status</dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {formatEnumLabel(project.status)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-zinc-500">
                    Content type
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {formatEnumLabel(project.contentType)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-zinc-500">
                    Publish date
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {formatDate(project.publishDate)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-zinc-500">
                    Task progress
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {taskProgress}% complete
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-zinc-500">
                    Created at
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {formatDateTime(project.createdAt)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-zinc-500">
                    Updated at
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {formatDateTime(project.updatedAt)}
                  </dd>
                </div>
              </dl>
            </aside>

            <aside className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Danger Zone
              </p>
              <h2 className="mt-2 text-lg font-semibold text-zinc-950">
                Delete project
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Delete this project from your workspace using a small
                confirmation step before anything is removed.
              </p>

              <div className="mt-6">
                <Link
                  href={`/projects/${project.id}/delete`}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-red-200 px-5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Delete Project
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
