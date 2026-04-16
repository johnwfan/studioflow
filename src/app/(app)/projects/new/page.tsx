import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

const DEV_USER_ID = "studioflow-dev-user";

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

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function createProject(formData: FormData) {
  "use server";

  const title = formData.get("title");
  const description = formData.get("description");
  const notes = formData.get("notes");
  const status = formData.get("status");
  const contentType = formData.get("contentType");
  const publishDate = formData.get("publishDate");

  const trimmedTitle = typeof title === "string" ? title.trim() : "";

  if (!trimmedTitle) {
    redirect("/projects/new?error=title");
  }

  await prisma.user.upsert({
    where: {
      id: DEV_USER_ID,
    },
    update: {
      email: "dev@studioflow.local",
      name: "Studioflow Dev",
    },
    create: {
      id: DEV_USER_ID,
      email: "dev@studioflow.local",
      name: "Studioflow Dev",
    },
  });

  const project = await prisma.project.create({
    data: {
      title: trimmedTitle,
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      status: statusOptions.includes(status as (typeof statusOptions)[number])
        ? (status as (typeof statusOptions)[number])
        : "IDEA",
      contentType: contentTypeOptions.includes(
        contentType as (typeof contentTypeOptions)[number],
      )
        ? (contentType as (typeof contentTypeOptions)[number])
        : "OTHER",
      publishDate:
        typeof publishDate === "string" && publishDate
          ? new Date(publishDate)
          : null,
      userId: DEV_USER_ID,
    },
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  redirect(`/projects/${project.id}`);
}

type NewProjectPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function NewProjectPage({
  searchParams,
}: NewProjectPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const titleError = resolvedSearchParams?.error === "title";

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Create Project
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            New project
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
            Capture a new idea, add a little production context, and send it
            straight into your Studioflow workspace.
          </p>
        </header>

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                Project details
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Keep it simple for now. You can expand the workflow later.
              </p>
            </div>

            <Link
              href="/projects"
              className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
            >
              Back to projects
            </Link>
          </div>

          <form action={createProject} className="mt-8 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-zinc-800"
              >
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="How I plan a week of content"
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
              {titleError ? (
                <p className="text-sm text-red-600">
                  Title is required before you can create a project.
                </p>
              ) : null}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="status"
                  className="text-sm font-medium text-zinc-800"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue="IDEA"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatEnumLabel(option)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contentType"
                  className="text-sm font-medium text-zinc-800"
                >
                  Content type
                </label>
                <select
                  id="contentType"
                  name="contentType"
                  defaultValue="YOUTUBE"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                >
                  {contentTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatEnumLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-zinc-800"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Give this project a quick summary so future-you knows what it is."
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm leading-6 text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="notes"
                className="text-sm font-medium text-zinc-800"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={6}
                placeholder="Add scripting notes, thumbnail ideas, hooks, production reminders, or anything else helpful."
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm leading-6 text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="publishDate"
                className="text-sm font-medium text-zinc-800"
              >
                Publish date
              </label>
              <input
                id="publishDate"
                name="publishDate"
                type="datetime-local"
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
              <p className="text-sm text-zinc-500">
                Leave this blank if the project is not scheduled yet.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href="/projects"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Create project
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
