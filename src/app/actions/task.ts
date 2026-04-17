"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleTaskCompletion(taskId: string) {
  const userId = await requireUserId();

  // Verify the task belongs to the user's project
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        userId,
      },
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Toggle the completed status
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { completed: !task.completed },
  });

  // Revalidate the dashboard to update progress bars
  revalidatePath("/(app)/dashboard");

  return updatedTask;
}
