"use client";

import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-ink/50 hover:text-ink"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
