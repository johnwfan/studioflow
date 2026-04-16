import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type DeleteProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function DeleteProjectPage({
  params,
  searchParams,
}: DeleteProjectPageProps) {
  const { id } = await params;
  const userId = await requireUserId();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const confirmationError = resolvedSearchParams?.error === "confirm";

  const project = await prisma.project.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          tasks: true,
          assetLinks: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  async function confirmDeleteProject(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();

    const confirmationText = formData.get("confirmationText");
    const typedValue =
      typeof confirmationText === "string" ? confirmationText.trim() : "";

    const ownedProject = await prisma.project.findFirst({
      where: {
        id: project.id,
        userId: currentUserId,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!ownedProject) {
      notFound();
    }

    if (typedValue !== ownedProject.title) {
      redirect(`/projects/${ownedProject.id}/delete?error=confirm`);
    }

    await prisma.$transaction([
      prisma.task.deleteMany({
        where: {
          projectId: ownedProject.id,
        },
      }),
      prisma.assetLink.deleteMany({
        where: {
          projectId: ownedProject.id,
        },
      }),
      prisma.project.delete({
        where: {
          id: ownedProject.id,
        },
      }),
    ]);

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    revalidatePath("/workflow");
    redirect("/projects");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Delete Project
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Confirm deletion
          </h1>
          <p className="mt-3 text-sm leading-7 text-zinc-600 sm:text-base">
            This will permanently remove <span className="font-medium text-zinc-900">{project.title}</span>,
            along with its tasks and asset links.
          </p>
        </header>

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">
              This action cannot be undone.
            </p>
            <p className="mt-2 text-sm leading-6 text-red-600">
              {project._count.tasks} {project._count.tasks === 1 ? "task" : "tasks"} and{" "}
              {project._count.assetLinks}{" "}
              {project._count.assetLinks === 1 ? "asset link" : "asset links"} will
              be removed with this project.
            </p>
          </div>

          <form action={confirmDeleteProject} className="mt-8 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="confirmationText"
                className="text-sm font-medium text-zinc-800"
              >
                Type the project title to confirm
              </label>
              <input
                id="confirmationText"
                name="confirmationText"
                type="text"
                required
                placeholder={project.title}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
              {confirmationError ? (
                <p className="text-sm text-red-600">
                  Enter the exact project title before deleting it.
                </p>
              ) : null}
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
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-red-600 px-5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Permanently Delete
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
