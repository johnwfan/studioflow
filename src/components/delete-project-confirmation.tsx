"use client";

import SubmitButton from "@/components/ui/submit-button";

export default function DeleteProjectConfirmation() {
  return (
    <SubmitButton
      variant="destructive"
      size="lg"
      pendingLabel="Deleting project..."
      onClick={(event) => {
        const confirmed = window.confirm(
          "Are you sure you want to permanently delete this project? This cannot be undone.",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      Permanently delete
    </SubmitButton>
  );
}
