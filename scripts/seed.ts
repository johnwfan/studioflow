import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "john@example.com",
      name: "John",
    },
  });

  await prisma.project.createMany({
    data: [
      {
        title: "Minecraft channel intro",
        description: "Intro video explaining my style and creator identity",
        notes: "Need cold open, cinematic shots, voiceover, ending hook",
        status: "SCRIPTING",
        contentType: "YOUTUBE",
        userId: user.id,
      },
      {
        title: "Spooky modded survival video",
        description: "Story-driven Minecraft horror video concept",
        notes: "Need modlist, atmosphere, pacing ideas",
        status: "IDEA",
        contentType: "YOUTUBE",
        userId: user.id,
      },
      {
        title: "Thumbnail workflow test",
        description: "Experimenting with thumbnail composition and contrast",
        notes: "Try dramatic framing and minimal text",
        status: "EDITING",
        contentType: "SHORT_FORM",
        userId: user.id,
      },
    ],
  });
const users = await prisma.user.findMany();
const projects = await prisma.project.findMany();

console.log("users:", users);
console.log("projects:", projects);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
