import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="projects-page">
      <div className="projects-page__container">
        <div className="projects-page__header">
          <div>
            <p className="projects-page__eyebrow">
              workspace
            </p>
            <h1 className="projects-page__title">
              Projects
            </h1>
            <p className="projects-page__description">
              Manage your content pipeline from idea to published work.
            </p>
          </div>

          <div className="projects-page__count">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="projects-page__empty">
            <h2 className="projects-page__empty-title">No projects yet</h2>
            <p className="projects-page__empty-description">
              Your workspace is empty right now. Add your first project to get
              started.
            </p>
          </div>
        ) : (
          <div className="projects-page__grid">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block rounded-[inherit] transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
              >
                <article className="project-card">
                  <div className="project-card__header">
                    <div>
                      <h2 className="project-card__title">
                        {project.title}
                      </h2>
                      <p className="project-card__type">
                        {project.contentType.replace("_", " ")}
                      </p>
                    </div>

                    <span className="project-card__status">
                      {project.status.toLowerCase()}
                    </span>
                  </div>

                  <p className="project-card__description">
                    {project.description || "No description yet."}
                  </p>

                  <div className="project-card__meta">
                    <div className="project-card__meta-row">
                      <span className="project-card__meta-label">Created</span>
                      <span className="project-card__meta-value">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="project-card__meta-row">
                      <span className="project-card__meta-label">
                        Publish date
                      </span>
                      <span className="project-card__meta-value">
                        {project.publishDate
                          ? new Date(project.publishDate).toLocaleDateString()
                          : "Not scheduled"}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
