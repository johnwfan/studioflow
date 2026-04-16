"use client";

import { useClerk } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export default function SignOutAction() {
  const { signOut } = useClerk();

  return (
    <Button
      type="button"
      onClick={() => signOut({ redirectUrl: "/" })}
      variant="outline"
      size="lg"
    >
      Sign out
    </Button>
  );
}
