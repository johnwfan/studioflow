import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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

type EditProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTimeLocal(date: Date | null) {
  if (!date) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

export default async function EditProjectPage({
  params,
  searchParams,
}: EditProjectPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const titleError = resolvedSearchParams?.error === "title";

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    notFound();
  }

  async function updateProject(formData: FormData) {
    "use server";

    const title = formData.get("title");
    const description = formData.get("description");
    const notes = formData.get("notes");
    const status = formData.get("status");
    const contentType = formData.get("contentType");
    const publishDate = formData.get("publishDate");

    const trimmedTitle = typeof title === "string" ? title.trim() : "";

    if (!trimmedTitle) {
      redirect(`/projects/${id}/edit?error=title`);
    }

    const updatedProject = await prisma.project.update({
      where: {
        id,
      },
      data: {
        title: trimmedTitle,
        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
        notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
        status: statusOptions.includes(status as (typeof statusOptions)[number])
          ? (status as (typeof statusOptions)[number])
          : project.status,
        contentType: contentTypeOptions.includes(
          contentType as (typeof contentTypeOptions)[number],
        )
          ? (contentType as (typeof contentTypeOptions)[number])
          : project.contentType,
        publishDate:
          typeof publishDate === "string" && publishDate
            ? new Date(publishDate)
            : null,
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    redirect(`/projects/${updatedProject.id}`);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Edit Project
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            {project.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
            Update the core details for this project without adding extra
            workflow complexity yet.
          </p>
        </header>

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                Project details
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Edit the title, planning notes, and schedule in one place.
              </p>
            </div>

            <Link
              href={`/projects/${project.id}`}
              className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
            >
              Back to project
            </Link>
          </div>

          <form action={updateProject} className="mt-8 space-y-6">
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
                defaultValue={project.title}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
              {titleError ? (
                <p className="text-sm text-red-600">
                  Title is required before you can save this project.
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
                  defaultValue={project.status}
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
                  defaultValue={project.contentType}
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
                defaultValue={project.description ?? ""}
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
                defaultValue={project.notes ?? ""}
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
                defaultValue={formatDateTimeLocal(project.publishDate)}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
              <p className="text-sm text-zinc-500">
                Leave this blank if the project should not be scheduled yet.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href={`/projects/${project.id}`}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Save changes
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
