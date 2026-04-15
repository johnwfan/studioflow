import { prisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              workspace
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Projects
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your content pipeline from idea to published work.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <h2 className="text-lg font-medium">No projects yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your workspace is empty right now. Add your first project to get
              started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                      {project.title}
                    </h2>
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                      {project.contentType.replace("_", " ")}
                    </p>
                  </div>

                  <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                    {project.status.toLowerCase()}
                  </span>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {project.description || "No description yet."}
                </p>

                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Publish date</span>
                    <span className="font-medium">
                      {project.publishDate
                        ? new Date(project.publishDate).toLocaleDateString()
                        : "Not scheduled"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}