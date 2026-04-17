"use client";

import { useEffect, useState } from "react";

import SubmitButton from "@/components/ui/submit-button";

type DeleteProjectConfirmationProps = {
  error?: boolean;
};

export default function DeleteProjectConfirmation({
  error = false,
}: DeleteProjectConfirmationProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="space-y-4">
      <div className="delete-countdown" aria-live="polite">
        <div>
          <p className="delete-countdown__label">Delete safeguard</p>
          <p className="delete-countdown__value">
            {countdown === 0 ? "Ready to delete" : `Unlocks in ${countdown}s`}
          </p>
        </div>
        <div className="delete-countdown__meter" aria-hidden="true">
          <div
            className="delete-countdown__meter-bar"
            style={{ width: `${((10 - countdown) / 10) * 100}%` }}
          />
        </div>
      </div>

      {error ? <p className="ui-error-text ui-error-text--animated">Enter the exact project title before deleting it.</p> : null}

      <SubmitButton
        variant="destructive"
        size="lg"
        pendingLabel="Deleting project..."
        disabled={countdown > 0}
      >
        Permanently delete
      </SubmitButton>
    </div>
  );
}
