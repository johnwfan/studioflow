import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import Breadcrumbs from "@/components/breadcrumbs";
import DeleteProjectConfirmation from "@/components/delete-project-confirmation";
import { Button } from "@/components/ui/button";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type DeleteProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DeleteProjectPage({
  params,
}: DeleteProjectPageProps) {
  const { id } = await params;
  const userId = await requireUserId();

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

  async function confirmDeleteProject() {
    "use server";

    const currentUserId = await requireUserId();

    const ownedProject = await prisma.project.findFirst({
      where: {
        id,
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
    redirect("/projects?deleted=1");
  }

  return (
    <div className="page-shell">
      <div className="page-shell__inner page-shell__inner--compact">
        <header className="page-header">
          <div className="page-header__body">
            <p className="page-header__eyebrow">Delete Project</p>
            <h1 className="page-header__title">Confirm deletion</h1>
          </div>
        </header>

        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Projects", href: "/projects" },
            { label: project.title, href: `/projects/${project.id}` },
            { label: "Delete" },
          ]}
        />

        <section className="page-section">
          <div className="danger-panel">
            <p className="text-sm font-semibold">This action cannot be undone.</p>
            <p className="mt-2 text-sm leading-6">
              {project._count.tasks} {project._count.tasks === 1 ? "task" : "tasks"} and{" "}
              {project._count.assetLinks}{" "}
              {project._count.assetLinks === 1 ? "asset link" : "asset links"} will
              be removed with this project.
            </p>
          </div>

          <form action={confirmDeleteProject} className="mt-8 space-y-6">
            <p className="text-sm leading-6 text-muted-foreground">
              Choosing delete will open one final browser confirmation before anything is removed.
            </p>

            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button asChild variant="outline" size="lg">
                <Link href={`/projects/${project.id}`}>Cancel</Link>
              </Button>
              <DeleteProjectConfirmation />
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
