"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import SubmitButton from "@/components/ui/submit-button";

type ProjectNote = {
  id: string;
  title: string;
  body: string;
};

type ProjectNotesListProps = {
  notes: ProjectNote[];
  deleteNote: (formData: FormData) => void | Promise<void>;
  updateNote: (formData: FormData) => void | Promise<void>;
};

export default function ProjectNotesList({
  notes,
  deleteNote,
  updateNote,
}: ProjectNotesListProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  if (notes.length === 0) {
    return (
      <p className="mt-5 text-sm leading-7 text-foreground">
        No notes yet.
      </p>
    );
  }

  return (
    <div className="mt-5 space-y-4">
      {notes.map((note) => (
        <article key={note.id}>
          {editingNoteId === note.id ? (
            <form action={updateNote} className="space-y-3">
              <input type="hidden" name="noteId" value={note.id} />
              <input
                name="title"
                type="text"
                required
                defaultValue={note.title}
                className="ui-input"
              />
              <textarea
                name="body"
                required
                defaultValue={note.body}
                className="ui-input min-h-28 resize-y"
              />
              <div className="flex flex-wrap items-center gap-2">
                <SubmitButton size="sm" pendingLabel="Saving...">
                  Save
                </SubmitButton>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingNoteId(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  {note.title}
                </h3>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-foreground">
                  {note.body}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingNoteId(note.id)}
                >
                  Edit
                </Button>
                <form action={deleteNote}>
                  <input type="hidden" name="noteId" value={note.id} />
                  <SubmitButton
                    variant="ghost"
                    size="sm"
                    pendingLabel="Deleting..."
                  >
                    Delete
                  </SubmitButton>
                </form>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
