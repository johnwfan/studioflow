import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

import SignOutAction from "@/components/sign-out-action";
import ThemePicker from "@/components/theme-picker";
import { Button } from "@/components/ui/button";

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
    <div className="page-shell">
      <div className="page-shell__inner">
        <header className="page-header">
          <div className="page-header__body">
            <p className="page-header__eyebrow">Workspace Settings</p>
            <h1 className="page-header__title">Settings</h1>
            <p className="page-header__description">
              Manage your account details and keep an eye on the settings that
              shape your Studioflow workspace.
            </p>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="page-section">
            <p className="page-section__eyebrow">Account</p>
            <h2 className="page-section__title">Profile details</h2>

            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={displayName}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-3xl border border-border object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-secondary text-xl font-semibold text-secondary-foreground">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-lg font-semibold text-foreground">{displayName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {primaryEmail ?? "No email available"}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Your account is handled by Clerk, and Studioflow uses that
                  identity to protect your workspace data.
                </p>
              </div>
            </div>
          </section>

          <section className="page-section">
            <p className="page-section__eyebrow">Account Actions</p>
            <h2 className="page-section__title">Security and access</h2>

            <div className="mt-6 space-y-4">
              <div className="surface-subtle">
                <p className="text-sm font-medium text-foreground">
                  Manage your Clerk account
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Update profile information, connected sign-in methods, and
                  account security details.
                </p>
                <div className="mt-4">
                  <Button asChild size="lg">
                    <Link href="/user-profile">Manage account</Link>
                  </Button>
                </div>
              </div>

              <div className="surface-subtle">
                <p className="text-sm font-medium text-foreground">Sign out</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  End your current session and return to the public landing page.
                </p>
                <div className="mt-4">
                  <SignOutAction />
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="page-section">
          <p className="page-section__eyebrow">Theme</p>
          <h2 className="page-section__title">Choose your workspace look</h2>
          <p className="page-section__description">
            Pick the visual style that feels right for your workflow. The
            selected theme updates the full app and stays saved across refreshes.
          </p>

          <div className="mt-6">
            <ThemePicker />
          </div>
        </section>

        <section className="page-section">
          <p className="page-section__eyebrow">Preferences</p>
          <h2 className="page-section__title">Workspace preferences</h2>
          <p className="page-section__description">
            These remaining controls are intentionally lightweight for MVP. They
            show where personal workspace settings will continue to grow.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="surface-subtle">
              <p className="text-sm font-medium text-foreground">
                Default content type
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Coming soon. You will be able to choose the content type that
                new projects start with.
              </p>
            </article>

            <article className="surface-subtle">
              <p className="text-sm font-medium text-foreground">Timezone</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Coming soon. Calendar and scheduling defaults will be shown here.
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
