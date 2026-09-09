import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";
import { getAllPosts, savePost } from "@/lib/store";
import type { Post } from "@/lib/types";

export async function GET() {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getAllPosts());
}

export async function POST(request: Request) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const post = (await request.json()) as Post;
  if (!post.id) post.id = crypto.randomUUID();
  if (!post.slug) post.slug = post.id;
  if (!post.date) post.date = new Date().toISOString().slice(0, 10);
  return NextResponse.json(await savePost(post));
}
