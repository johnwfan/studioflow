"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { toggleTaskCompletion } from "@/app/actions/task";

interface TaskItemProps {
  id: string;
  text: string;
  completed: boolean;
  projectId: string;
  projectTitle: string;
}

export function TaskItem({
  id,
  text,
  completed,
  projectId,
  projectTitle,
}: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleCompletion = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      await toggleTaskCompletion(id);
      setIsCompleted(!isCompleted);
    } catch (error) {
      console.error("Failed to update task:", error);
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  return (
    <Link
      href={`/projects/${projectId}`}
      className="list-card block"
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleCompletion}
          disabled={isLoading}
          className={`mt-0.5 h-6 w-6 flex-shrink-0 rounded-full border-2 transition-all ${
            isCompleted
              ? "border-green-500 bg-green-500"
              : "border-muted-foreground hover:border-foreground"
          } flex items-center justify-center`}
          aria-label={isCompleted ? "Mark task incomplete" : "Mark task complete"}
        >
          {isCompleted && <Check size={16} className="text-white" />}
        </button>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold ${
              isCompleted
                ? "line-through text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {text}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
            {projectTitle}
          </p>
        </div>
      </div>
    </Link>
  );
}
