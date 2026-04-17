"use client";

import { useRef } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Columns3,
  CalendarDays,
  Settings,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Workflow",
    href: "/workflow",
    icon: Columns3,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const userButtonCardRef = useRef<HTMLDivElement>(null);

  function openUserMenu() {
    userButtonCardRef.current?.querySelector("button")?.click();
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__inner">
        <div className="sidebar__brand">
          <Link href="/dashboard" className="sidebar__brand-link">
            <div>
              <p className="sidebar__brand-name">
                Studioflow
              </p>
              <p className="sidebar__brand-subtitle">
                creator workflow
              </p>
            </div>
          </Link>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "sidebar__nav-link",
                  isActive
                    ? "sidebar__nav-link--active"
                    : "sidebar__nav-link--inactive",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "sidebar__nav-icon",
                    isActive
                      ? "sidebar__nav-icon--active"
                      : "sidebar__nav-icon--inactive",
                  ].join(" ")}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar__workspace">
          <p className="sidebar__workspace-title">
            personal workspace
          </p>
          <p className="sidebar__workspace-description">
            plan, track, and ship your content in one place.
          </p>

          <div
            ref={userButtonCardRef}
            role="button"
            tabIndex={0}
            onClick={openUserMenu}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openUserMenu();
              }
            }}
            className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-700"
          >
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-10 w-10",
                },
              }}
              afterSignOutUrl="/"
            />

            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Signed in
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                manage your account
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
