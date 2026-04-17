import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import Breadcrumbs from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import SubmitButton from "@/components/ui/submit-button";
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
  const userId = await requireUserId();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const titleError = resolvedSearchParams?.error === "title";

  const project = await prisma.project.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!project) {
    notFound();
  }

  async function updateProject(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();

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

    const ownedProject = await prisma.project.findFirst({
      where: {
        id,
        userId: currentUserId,
      },
      select: {
        id: true,
        status: true,
        contentType: true,
      },
    });

    if (!ownedProject) {
      notFound();
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: ownedProject.id,
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
          : ownedProject.status,
        contentType: contentTypeOptions.includes(
          contentType as (typeof contentTypeOptions)[number],
        )
          ? (contentType as (typeof contentTypeOptions)[number])
          : ownedProject.contentType,
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
    revalidatePath("/workflow");
    redirect(`/projects/${updatedProject.id}?updated=1`);
  }

  return (
    <div className="page-shell">
      <div className="page-shell__inner page-shell__inner--narrow">
        <header className="page-header">
          <div className="page-header__content">
            <div className="page-header__body">
              <p className="page-header__eyebrow">Edit Project</p>
              <h1 className="page-header__title">{project.title}</h1>
              <p className="page-header__description">
                Update the plan, content type, schedule, and notes without losing momentum.
              </p>
            </div>

            <div className="page-header__actions">
              <Button asChild variant="outline" size="lg">
                <Link href={`/projects/${project.id}`}>Back to project</Link>
              </Button>
            </div>
          </div>
        </header>

        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Projects", href: "/projects" },
            { label: project.title, href: `/projects/${project.id}` },
            { label: "Edit" },
          ]}
        />

        <section className="page-section">
          <div className="page-section__header">
            <div>
              <p className="page-section__eyebrow">Project Details</p>
              <h2 className="page-section__title">Refine the plan</h2>
              <p className="page-section__description">
                Edit the title, planning notes, and schedule in one place.
              </p>
            </div>
          </div>

          <form action={updateProject} className="mt-8 space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={project.title}
                className="ui-input"
              />
              {titleError ? (
                <p className="ui-error-text">
                  Title is required before you can save this project.
                </p>
              ) : null}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-foreground">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={project.status}
                  className="ui-select"
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
                  className="text-sm font-medium text-foreground"
                >
                  Content type
                </label>
                <select
                  id="contentType"
                  name="contentType"
                  defaultValue={project.contentType}
                  className="ui-select"
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
                className="text-sm font-medium text-foreground"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={project.description ?? ""}
                className="ui-textarea"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-foreground">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={6}
                defaultValue={project.notes ?? ""}
                className="ui-textarea"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="publishDate"
                className="text-sm font-medium text-foreground"
              >
                Publish date
              </label>
              <input
                id="publishDate"
                name="publishDate"
                type="datetime-local"
                defaultValue={formatDateTimeLocal(project.publishDate)}
                className="ui-input"
              />
              <p className="ui-help-text">
                Leave this blank if the project should not be scheduled yet.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button asChild variant="outline" size="lg">
                <Link href={`/projects/${project.id}`}>Cancel</Link>
              </Button>
              <SubmitButton size="lg" pendingLabel="Saving changes...">
                Save changes
              </SubmitButton>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
