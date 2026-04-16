import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: {
      id,
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

  async function deleteProject() {
    "use server";

    await prisma.$transaction([
      prisma.task.deleteMany({
        where: {
          projectId: id,
        },
      }),
      prisma.assetLink.deleteMany({
        where: {
          projectId: id,
        },
      }),
      prisma.project.delete({
        where: {
          id,
        },
      }),
    ]);

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    redirect("/projects");
  }

  async function createTask(formData: FormData) {
    "use server";

    const text = formData.get("text");
    const trimmedText = typeof text === "string" ? text.trim() : "";

    if (!trimmedText) {
      return;
    }

    await prisma.task.create({
      data: {
        text: trimmedText,
        projectId: id,
      },
    });

    revalidatePath(`/projects/${id}`);
    revalidatePath("/dashboard");
  }

  async function toggleTaskCompletion(formData: FormData) {
    "use server";

    const taskId = formData.get("taskId");
    const completed = formData.get("completed");

    if (typeof taskId !== "string" || typeof completed !== "string") {
      return;
    }

    await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        completed: completed === "true",
      },
    });

    revalidatePath(`/projects/${id}`);
    revalidatePath("/dashboard");
  }

  async function createAssetLink(formData: FormData) {
    "use server";

    const label = formData.get("label");
    const url = formData.get("url");

    const trimmedLabel = typeof label === "string" ? label.trim() : "";
    const trimmedUrl = typeof url === "string" ? url.trim() : "";

    if (!trimmedLabel || !trimmedUrl) {
      return;
    }

    await prisma.assetLink.create({
      data: {
        label: trimmedLabel,
        url: trimmedUrl,
        projectId: id,
      },
    });

    revalidatePath(`/projects/${id}`);
  }

  const completedTaskCount = project.tasks.filter((task) => task.completed).length;
  const openTaskCount = project.tasks.length - completedTaskCount;

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
                  {completedTaskCount} completed • {openTaskCount} open
                </p>
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
                      className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
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
                    <a
                      key={assetLink.id}
                      href={assetLink.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-950">
                            {assetLink.label}
                          </p>
                          <p className="mt-1 truncate text-sm text-zinc-600">
                            {assetLink.url}
                          </p>
                        </div>

                        <span className="text-xs uppercase tracking-wide text-zinc-500">
                          {getLinkHostname(assetLink.url)}
                        </span>
                      </div>
                    </a>
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
                This permanently removes the project and any tasks or asset links
                attached to it.
              </p>

              <form action={deleteProject} className="mt-6">
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-red-200 px-5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Delete Project
                </button>
              </form>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
