"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  CalendarDays,
  Rows3,
} from "lucide-react";

import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CalendarView = "month" | "week" | "year";

type ScheduledProject = {
  id: string;
  title: string;
  status: "IDEA" | "SCRIPTING" | "FILMING" | "EDITING" | "SCHEDULED" | "PUBLISHED";
  contentType: string;
  description: string | null;
  publishDate: string;
};

type CalendarExperienceProps = {
  projects: ScheduledProject[];
};

type CalendarDay = {
  date: Date;
  dateKey: string;
  projects: ScheduledProject[];
  isCurrentMonth?: boolean;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addYears(date: Date, amount: number) {
  return new Date(date.getFullYear() + amount, date.getMonth(), 1);
}

function startOfWeek(date: Date) {
  return addDays(startOfDay(date), -startOfDay(date).getDay());
}

function endOfWeek(date: Date) {
  return addDays(startOfWeek(date), 6);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isSameMonth(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  );
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRangeLabel(view: CalendarView, focusDate: Date) {
  if (view === "month") {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(focusDate);
  }

  if (view === "week") {
    const start = startOfWeek(focusDate);
    const end = endOfWeek(focusDate);
    const startLabel = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(start);
    const endLabel = new Intl.DateTimeFormat("en-US", {
      month: start.getMonth() === end.getMonth() ? undefined : "short",
      day: "numeric",
      year: "numeric",
    }).format(end);
    return `${startLabel} - ${endLabel}`;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
  }).format(focusDate);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildProjectsByDay(projects: ScheduledProject[]) {
  const projectsByDay = new Map<string, ScheduledProject[]>();

  for (const project of projects) {
    const publishDate = new Date(project.publishDate);
    const key = toDateKey(publishDate);
    const existing = projectsByDay.get(key) ?? [];
    existing.push(project);
    existing.sort(
      (left, right) =>
        new Date(left.publishDate).getTime() - new Date(right.publishDate).getTime(),
    );
    projectsByDay.set(key, existing);
  }

  return projectsByDay;
}

function getMonthDays(focusDate: Date, projectsByDay: Map<string, ScheduledProject[]>) {
  const monthStart = startOfMonth(focusDate);
  const monthEnd = endOfMonth(focusDate);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days: CalendarDay[] = [];

  for (
    let current = gridStart;
    current <= gridEnd;
    current = addDays(current, 1)
  ) {
    const dayDate = startOfDay(current);
    const dateKey = toDateKey(dayDate);
    days.push({
      date: dayDate,
      dateKey,
      projects: projectsByDay.get(dateKey) ?? [],
      isCurrentMonth: isSameMonth(dayDate, focusDate),
    });
  }

  return days;
}

function getWeekDays(focusDate: Date, projectsByDay: Map<string, ScheduledProject[]>) {
  const start = startOfWeek(focusDate);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const dateKey = toDateKey(date);
    return {
      date,
      dateKey,
      projects: projectsByDay.get(dateKey) ?? [],
    };
  });
}

function getYearMonths(focusDate: Date, projectsByDay: Map<string, ScheduledProject[]>) {
  return Array.from({ length: 12 }, (_, index) => {
    const monthDate = new Date(focusDate.getFullYear(), index, 1);
    const monthDays = getMonthDays(monthDate, projectsByDay);
    return {
      label: formatMonthLabel(monthDate),
      monthDate,
      days: monthDays,
    };
  });
}

function getToday() {
  return startOfDay(new Date());
}

function moveFocusDate(date: Date, view: CalendarView, direction: -1 | 1) {
  if (view === "month") {
    return addMonths(date, direction);
  }

  if (view === "week") {
    return addDays(date, 7 * direction);
  }

  return addYears(date, direction);
}

function ProjectHoverCard({
  projects,
}: {
  projects: ScheduledProject[];
}) {
  return (
    <div className="calendar-hover-card" role="dialog" aria-label="Scheduled projects">
      <div className="calendar-hover-card__inner">
        {projects.map((project) => {
          const publishDate = new Date(project.publishDate);

          return (
            <div key={project.id} className="calendar-hover-card__project">
              <div className="calendar-hover-card__header">
                <div className="min-w-0">
                  <p className="calendar-hover-card__eyebrow">Scheduled project</p>
                  <h4 className="calendar-hover-card__title">{project.title}</h4>
                </div>
                <StatusBadge status={project.status} />
              </div>

              <div className="calendar-hover-card__meta">
                <span className="chip">{formatEnumLabel(project.contentType)}</span>
                <span className="chip">{formatDateTime(publishDate)}</span>
              </div>

              {project.description ? (
                <p className="calendar-hover-card__description">{project.description}</p>
              ) : null}

              <div className="calendar-hover-card__actions">
                <Link href={`/projects/${project.id}`} className="calendar-hover-card__link">
                  Open project
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectMarker({
  projects,
  label,
  variant = "pill",
}: {
  projects: ScheduledProject[];
  label: React.ReactNode;
  variant?: "pill" | "dot" | "row";
}) {
  return (
    <div
      className={cn(
        "calendar-marker-group",
        variant === "dot" && "calendar-marker-group--dot",
      )}
    >
      <button type="button" className={cn("calendar-marker", `calendar-marker--${variant}`)}>
        {label}
      </button>
      <ProjectHoverCard projects={projects} />
    </div>
  );
}

function CalendarToolbar({
  view,
  focusDate,
  onViewChange,
  onPrevious,
  onToday,
  onNext,
}: {
  view: CalendarView;
  focusDate: Date;
  onViewChange: (view: CalendarView) => void;
  onPrevious: () => void;
  onToday: () => void;
  onNext: () => void;
}) {
  const viewOptions: Array<{ id: CalendarView; label: string; icon: typeof CalendarDays }> = [
    { id: "month", label: "Month", icon: CalendarDays },
    { id: "week", label: "Week", icon: Rows3 },
    { id: "year", label: "Year", icon: CalendarRange },
  ];

  return (
    <div className="calendar-toolbar">
      <div>
        <p className="page-section__eyebrow">Views</p>
        <h2 className="calendar-toolbar__title">{formatRangeLabel(view, focusDate)}</h2>
      </div>

      <div className="calendar-toolbar__controls">
        <div className="calendar-view-switcher" role="tablist" aria-label="Calendar views">
          {viewOptions.map((option) => {
            const Icon = option.icon;
            const isActive = option.id === view;

            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={cn(
                  "calendar-view-switcher__button",
                  isActive && "calendar-view-switcher__button--active",
                )}
                onClick={() => onViewChange(option.id)}
              >
                <Icon className="size-4" />
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="calendar-nav">
          <Button variant="outline" size="sm" onClick={onPrevious}>
            <ArrowLeft className="size-4" />
            Previous
          </Button>
          <Button variant="ghost" size="sm" onClick={onToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={onNext}>
            Next
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MonthCalendarView({
  focusDate,
  projectsByDay,
}: {
  focusDate: Date;
  projectsByDay: Map<string, ScheduledProject[]>;
}) {
  const today = getToday();
  const days = getMonthDays(focusDate, projectsByDay);

  return (
    <div className="calendar-month">
      <div className="calendar-weekdays">
        {weekdayLabels.map((label) => (
          <div key={label} className="calendar-weekdays__label">
            {label}
          </div>
        ))}
      </div>

      <div className="calendar-month__grid">
        {days.map((day) => {
          const visibleProjects = day.projects.slice(0, 3);
          const overflowCount = day.projects.length - visibleProjects.length;

          return (
            <div
              key={day.dateKey}
              className={cn(
                "calendar-day-card",
                !day.isCurrentMonth && "calendar-day-card--outside",
                isSameDay(day.date, today) && "calendar-day-card--today",
              )}
            >
              <div className="calendar-day-card__header">
                <span className="calendar-day-card__number">{day.date.getDate()}</span>
                {day.projects.length > 0 ? (
                  <span className="calendar-day-card__count">
                    {day.projects.length} scheduled
                  </span>
                ) : null}
              </div>

              <div className="calendar-day-card__markers">
                {visibleProjects.map((project) => (
                  <ProjectMarker
                    key={project.id}
                    projects={[project]}
                    label={<span className="truncate">{project.title}</span>}
                  />
                ))}

                {overflowCount > 0 ? (
                  <ProjectMarker
                    projects={day.projects}
                    label={`+${overflowCount} more`}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekCalendarView({
  focusDate,
  projectsByDay,
}: {
  focusDate: Date;
  projectsByDay: Map<string, ScheduledProject[]>;
}) {
  const today = getToday();
  const days = getWeekDays(focusDate, projectsByDay);

  return (
    <div className="calendar-week">
      {days.map((day) => (
        <section
          key={day.dateKey}
          className={cn(
            "calendar-week-day",
            isSameDay(day.date, today) && "calendar-week-day--today",
          )}
        >
          <header className="calendar-week-day__header">
            <p className="calendar-week-day__label">{formatDayLabel(day.date)}</p>
            <p className="calendar-week-day__number">{day.date.getDate()}</p>
          </header>

          {day.projects.length === 0 ? (
            <p className="calendar-week-day__empty">Nothing scheduled</p>
          ) : (
            <div className="calendar-week-day__list">
              {day.projects.map((project) => (
                <ProjectMarker
                  key={project.id}
                  projects={[project]}
                  variant="row"
                  label={
                    <>
                      <span className="truncate">{project.title}</span>
                      <span className="calendar-row-time">
                        {new Intl.DateTimeFormat("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(project.publishDate))}
                      </span>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function YearCalendarView({
  focusDate,
  projectsByDay,
}: {
  focusDate: Date;
  projectsByDay: Map<string, ScheduledProject[]>;
}) {
  const today = getToday();
  const months = getYearMonths(focusDate, projectsByDay);

  return (
    <div className="calendar-year">
      {months.map((month) => (
        <section key={month.label} className="calendar-year-month">
          <header className="calendar-year-month__header">
            <h3 className="calendar-year-month__title">{month.label}</h3>
          </header>

          <div className="calendar-year-month__weekdays">
            {weekdayLabels.map((label) => (
              <span key={label}>{label.slice(0, 1)}</span>
            ))}
          </div>

          <div className="calendar-year-month__grid">
            {month.days.map((day) => (
              <div
                key={day.dateKey}
                className={cn(
                  "calendar-year-day",
                  !day.isCurrentMonth && "calendar-year-day--outside",
                  isSameDay(day.date, today) && "calendar-year-day--today",
                )}
              >
                <span className="calendar-year-day__number">{day.date.getDate()}</span>
                {day.projects.length > 0 ? (
                  <ProjectMarker
                    projects={day.projects}
                    variant="dot"
                    label={<span className="sr-only">{day.projects.length} projects</span>}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function CalendarExperience({ projects }: CalendarExperienceProps) {
  const [view, setView] = useState<CalendarView>("month");
  const [focusDate, setFocusDate] = useState(getToday());
  const projectsByDay = buildProjectsByDay(projects);

  return (
    <section className="page-section calendar-shell">
      <CalendarToolbar
        view={view}
        focusDate={focusDate}
        onViewChange={setView}
        onPrevious={() => setFocusDate((current) => moveFocusDate(current, view, -1))}
        onToday={() => setFocusDate(getToday())}
        onNext={() => setFocusDate((current) => moveFocusDate(current, view, 1))}
      />

      <div className="calendar-surface">
        {view === "month" ? (
          <MonthCalendarView focusDate={focusDate} projectsByDay={projectsByDay} />
        ) : null}

        {view === "week" ? (
          <WeekCalendarView focusDate={focusDate} projectsByDay={projectsByDay} />
        ) : null}

        {view === "year" ? (
          <YearCalendarView focusDate={focusDate} projectsByDay={projectsByDay} />
        ) : null}
      </div>
    </section>
  );
}
