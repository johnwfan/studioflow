import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  hint?: string;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
  actionIcon: ActionIcon,
  hint,
}: EmptyStateProps) {
  return (
    <section className="surface-empty">
      <div className="surface-empty__icon-wrap">
        <div className="surface-empty__icon">
          <Icon className="size-7" />
        </div>
      </div>
      <div className="surface-empty__content">
        <h2 className="surface-empty__title">{title}</h2>
        <p className="surface-empty__description">{description}</p>
        {hint ? <p className="surface-empty__hint">{hint}</p> : null}
      </div>
      {actionHref && actionLabel ? (
        <div className="surface-empty__actions">
          <Button asChild size="lg">
            <Link href={actionHref}>
              {ActionIcon ? <ActionIcon className="size-4" /> : null}
              {actionLabel}
            </Link>
          </Button>
        </div>
      ) : null}
    </section>
  );
}
