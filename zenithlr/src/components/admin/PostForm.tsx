"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BilingualField } from "./BilingualField";
import type { Post } from "@/lib/types";

export function emptyPost(): Post {
  return {
    id: "new",
    slug: "",
    published: false,
    date: new Date().toISOString().slice(0, 10),
    title: { en: "", es: "" },
    excerpt: { en: "", es: "" },
    body: { en: "", es: "" },
  };
}

export function PostForm({ initial, isNew }: { initial?: Post; isNew?: boolean }) {
  const router = useRouter();
  const [post, setPost] = useState(initial ?? emptyPost());
  const [status, setStatus] = useState("");

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const payload = {
          ...post,
          id: post.id === "new" ? crypto.randomUUID() : post.id,
          slug: post.slug || post.title.en.toLowerCase().replace(/\s+/g, "-"),
        };
        setStatus("Saving…");
        const res = await fetch(isNew ? "/api/posts" : `/api/posts/${post.id}`, {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          setStatus("Could not save");
          return;
        }
        router.push("/admin/blog");
        router.refresh();
      }}
    >
      <BilingualField
        label="Title"
        value={post.title}
        onChange={(title) => setPost({ ...post, title })}
      />
      <BilingualField
        label="Excerpt"
        multiline
        value={post.excerpt}
        onChange={(excerpt) => setPost({ ...post, excerpt })}
      />
      <BilingualField
        label="Body"
        multiline
        value={post.body}
        onChange={(body) => setPost({ ...post, body })}
      />
      <label className="text-xs uppercase text-sand-deep">
        Slug
        <input
          className="admin-input mt-2"
          value={post.slug}
          onChange={(e) => setPost({ ...post, slug: e.target.value })}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={post.published}
          onChange={(e) => setPost({ ...post, published: e.target.checked })}
        />
        Published
      </label>
      <button
        type="submit"
        className="bg-ink px-6 py-3 text-[11px] tracking-[0.18em] uppercase text-sand"
      >
        Save article
      </button>
      {status && <p className="text-sm text-sand-deep">{status}</p>}
    </form>
  );
}
