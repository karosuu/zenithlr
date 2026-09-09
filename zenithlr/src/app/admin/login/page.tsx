"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5">
      <form
        className="w-full max-w-md border border-sand-soft bg-cream p-8"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget).entries());
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) {
            setError("Invalid email or password");
            return;
          }
          router.push("/admin");
          router.refresh();
        }}
      >
        <p className="font-serif text-3xl">Zenith</p>
        <p className="mt-1 text-[11px] tracking-[0.22em] uppercase text-sand-deep">
          Team panel
        </p>
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="admin-input mt-8"
          defaultValue="management@zenithlr.com"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="admin-input mt-3"
        />
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          className="mt-6 w-full bg-ink py-3 text-[11px] tracking-[0.2em] uppercase text-sand"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
