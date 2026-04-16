import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-start justify-center">
        <div className="w-full rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <UserProfile
            path="/user-profile"
            routing="path"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-none border-0",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
