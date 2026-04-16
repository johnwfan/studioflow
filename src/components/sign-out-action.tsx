"use client";

import { useClerk } from "@clerk/nextjs";

export default function SignOutAction() {
  const { signOut } = useClerk();

  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/" })}
      className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
    >
      Sign out
    </button>
  );
}
