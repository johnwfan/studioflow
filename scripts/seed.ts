import "dotenv/config";

import { prisma } from "../src/lib/prisma";

const seedUser = {
  email: "studioflow-demo@example.com",
  name: "Studioflow Demo",
};

const projectSeedData = [
  {
    title: "Studio Tour: Creator Desk Setup",
    description:
      "A polished YouTube video showing the current filming desk, lighting, and audio workflow.",
    notes:
      "Finalize b-roll list, tighten intro hook, and confirm the thumbnail frame before export.",
    status: "SCHEDULED" as const,
    contentType: "YOUTUBE" as const,
    publishDate: new Date("2026-04-20T09:00:00"),
  },
  {
    title: "Desk Setup Thumbnail Variations",
    description:
      "A short-form post testing three thumbnail directions for the studio tour upload.",
    notes:
      "Try one clean version, one high-contrast version, and one with large text for comparison.",
    status: "EDITING" as const,
    contentType: "SHORT_FORM" as const,
    publishDate: new Date("2026-04-20T14:30:00"),
  },
  {
    title: "How I Batch Content for a Week",
    description:
      "A workflow-focused video breaking down planning, scripting, filming, and scheduling in one system.",
    notes:
      "Outline the four-part structure and add a section about balancing long-form and short-form content.",
    status: "SCRIPTING" as const,
    contentType: "YOUTUBE" as const,
    publishDate: new Date("2026-04-22T10:00:00"),
  },
  {
    title: "Weekly Livestream Planning Session",
    description:
      "A live planning stream to review the content calendar and choose next week's priorities.",
    notes:
      "Prepare agenda, collect questions from Discord, and preload project notes before going live.",
    status: "SCHEDULED" as const,
    contentType: "STREAM" as const,
    publishDate: new Date("2026-04-24T18:00:00"),
  },
  {
    title: "April Content Review Podcast",
    description:
      "A podcast-style recap covering what performed well, what missed, and what to improve next month.",
    notes:
      "Record a cleaner intro, mention the thumbnail experiment results, and keep the episode under 20 minutes.",
    status: "FILMING" as const,
    contentType: "PODCAST" as const,
    publishDate: new Date("2026-04-26T08:30:00"),
  },
  {
    title: "Notion Script Template Walkthrough",
    description:
      "A tutorial idea showing the scripting template used to move from rough idea to filming outline.",
    notes:
      "Still needs examples for hook, beats, and CTA sections before this is ready to schedule.",
    status: "IDEA" as const,
    contentType: "YOUTUBE" as const,
    publishDate: null,
  },
  {
    title: "Channel Banner Refresh",
    description:
      "A brand update project for new channel art and supporting visual assets.",
    notes:
      "Explore cleaner typography, softer background texture, and thumbnail color alignment.",
    status: "IDEA" as const,
    contentType: "OTHER" as const,
    publishDate: null,
  },
];

async function main() {
  const user = await prisma.user.upsert({
    where: { email: seedUser.email },
    update: {
      name: seedUser.name,
    },
    create: seedUser,
  });

  const existingProjects = await prisma.project.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  const existingProjectIds = existingProjects.map((project) => project.id);

  if (existingProjectIds.length > 0) {
    await prisma.task.deleteMany({
      where: {
        projectId: {
          in: existingProjectIds,
        },
      },
    });

    await prisma.assetLink.deleteMany({
      where: {
        projectId: {
          in: existingProjectIds,
        },
      },
    });

    await prisma.project.deleteMany({
      where: {
        userId: user.id,
      },
    });
  }

  for (const project of projectSeedData) {
    await prisma.project.create({
      data: {
        ...project,
        userId: user.id,
      },
    });
  }

  const seededProjects = await prisma.project.findMany({
    where: {
      userId: user.id,
    },
    orderBy: [
      {
        publishDate: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    select: {
      id: true,
      title: true,
      status: true,
      contentType: true,
      publishDate: true,
    },
  });

  console.log("Seeded user:");
  console.log(user);
  console.log("");
  console.log("Seeded projects:");
  console.table(
    seededProjects.map((project) => ({
      id: project.id,
      title: project.title,
      status: project.status,
      contentType: project.contentType,
      publishDate: project.publishDate,
    })),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:");
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
