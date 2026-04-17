type StatusBadgeProps = {
  status: "IDEA" | "SCRIPTING" | "FILMING" | "EDITING" | "SCHEDULED" | "PUBLISHED";
};

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`project-card__status project-card__status--${status.toLowerCase()}`}>
      <span className="project-card__status-dot" aria-hidden="true" />
      {status === "FILMING" ? (
        <span className="project-card__status-wave" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      ) : null}
      {status === "PUBLISHED" ? (
        <span className="project-card__status-check" aria-hidden="true">
          ✓
        </span>
      ) : null}
      <span>{formatEnumLabel(status)}</span>
    </span>
  );
}
