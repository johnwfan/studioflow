import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

import SignOutAction from "@/components/sign-out-action";
import ThemePicker from "@/components/theme-picker";

function getDisplayName(name: string | null | undefined, email: string | undefined) {
  if (name && name.trim()) {
    return name;
  }

  return email ?? "Studioflow User";
}

export default async function SettingsPage() {
  const user = await currentUser();

  const primaryEmail = user?.emailAddresses.find(
    (emailAddress) => emailAddress.id === user.primaryEmailAddressId,
  )?.emailAddress;

  const displayName = getDisplayName(user?.fullName, primaryEmail);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Workspace Settings
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Settings
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
            Manage your account details and keep an eye on the settings that
            will shape your Studioflow workspace as the product grows.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Account
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">
              Profile details
            </h2>

            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={displayName}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-3xl border border-zinc-200 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-zinc-200 bg-zinc-100 text-xl font-semibold text-zinc-700">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-lg font-semibold text-zinc-950">
                  {displayName}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  {primaryEmail ?? "No email available"}
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Your account is handled by Clerk, and Studioflow uses that
                  identity to protect your workspace data.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Account Actions
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">
              Security and account access
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm font-medium text-zinc-900">
                  Manage your Clerk account
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Update profile information, connected sign-in methods, and
                  account security details.
                </p>
                <div className="mt-4">
                  <Link
                    href="/user-profile"
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
                  >
                    Manage account
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm font-medium text-zinc-900">Sign out</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  End your current session and return to the public landing
                  page.
                </p>
                <div className="mt-4">
                  <SignOutAction />
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Theme
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">
            Choose your workspace look
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
            Pick the visual style that feels right for your workflow. The
            selected theme updates the full app and stays saved across refreshes.
          </p>

          <div className="mt-6">
            <ThemePicker />
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Preferences
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">
            Workspace preferences
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600">
            These remaining controls are intentionally lightweight for MVP. They
            show where personal workspace settings will continue to grow.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <p className="text-sm font-medium text-zinc-900">
                Default content type
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Coming soon. You will be able to choose the content type that
                new projects start with.
              </p>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <p className="text-sm font-medium text-zinc-900">Timezone</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Coming soon. Calendar and scheduling defaults will be shown
                here.
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
