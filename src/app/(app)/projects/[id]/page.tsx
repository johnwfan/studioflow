import { notFound } from "next/navigation";

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

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Project Overview
          </p>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                {project.title}
              </h1>
              <p className="mt-4 text-sm leading-7 text-zinc-600 sm:text-base">
                {project.description || "No description has been added yet."}
              </p>
            </div>

            <div className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
              {formatEnumLabel(project.status)}
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-zinc-950">Content</h2>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-zinc-600">
                {formatEnumLabel(project.contentType)}
              </span>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-sm font-medium text-zinc-500">Description</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-700 sm:text-base">
                  {project.description || "No description has been added yet."}
                </p>
              </div>

              <div className="border-t border-zinc-200 pt-6">
                <p className="text-sm font-medium text-zinc-500">Notes</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-700 sm:text-base">
                  {project.notes || "No notes yet."}
                </p>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Details</h2>

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
        </div>
      </div>
    </div>
  );
}
