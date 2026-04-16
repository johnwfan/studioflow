import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

  const userId = await requireUserId();

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
      userId,
    },
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/workflow");
  redirect(`/projects/${project.id}?created=1`);
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
    <div className="page-shell">
      <div className="page-shell__inner page-shell__inner--narrow">
        <header className="page-header">
          <div className="page-header__content">
            <div className="page-header__body">
              <p className="page-header__eyebrow">Create Project</p>
              <h1 className="page-header__title">New project</h1>
            </div>

            <div className="page-header__actions">
              <Button asChild variant="outline" size="lg">
                <Link href="/projects">Back to projects</Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="page-section">
          <div className="page-section__header">
            <div>
              <p className="page-section__eyebrow">Project Details</p>
              <h2 className="page-section__title">Start simple</h2>
              <p className="page-section__description">
                Give the project enough structure to become actionable without
                adding extra workflow complexity yet.
              </p>
            </div>
          </div>

          <form action={createProject} className="mt-8 space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="How I plan a week of content"
                className="ui-input"
              />
              {titleError ? (
                <p className="ui-error-text">
                  Title is required before you can create a project.
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
                  defaultValue="IDEA"
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
                  defaultValue="YOUTUBE"
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
                placeholder="Give this project a quick summary so future-you knows what it is."
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
                placeholder="Add scripting notes, thumbnail ideas, hooks, production reminders, or anything else helpful."
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
                className="ui-input"
              />
              <p className="ui-help-text">
                Leave this blank if the project is not scheduled yet.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button asChild variant="outline" size="lg">
                <Link href="/projects">Cancel</Link>
              </Button>
              <SubmitButton size="lg" pendingLabel="Creating project...">
                Create project
              </SubmitButton>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
