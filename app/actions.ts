"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mutateDb, readDb } from "@/lib/db";
import { getCurrentUser, SESSION_COOKIE } from "@/lib/queries";
import { countChars, MAX_POST_LENGTH, type ActionResult, type Reaction } from "@/lib/types";

// Server Actions can be called with any arguments by a direct POST, so each one
// works out the acting user from the session and checks its own inputs.

function refresh() {
  revalidatePath("/", "layout");
}

export async function createPost(formData: FormData): Promise<ActionResult> {
  const me = await getCurrentUser();
  const text = String(formData.get("text") ?? "").trim();
  const replyToId = String(formData.get("replyToId") ?? "") || null;

  if (!text) return { error: "Write something first." };
  if (countChars(text) > MAX_POST_LENGTH) {
    return { error: `Posts can be at most ${MAX_POST_LENGTH} characters.` };
  }

  const error = mutateDb((db): string | null => {
    if (replyToId && !db.posts.some((p) => p.id === replyToId)) {
      return "That post no longer exists.";
    }
    db.posts.push({
      id: randomUUID(),
      authorId: me.id,
      text,
      createdAt: new Date().toISOString(),
      replyToId,
      likes: [],
      reposts: [],
    });
    return null;
  });
  if (error) return { error };

  refresh();
  return {};
}

function toggleReaction(list: Reaction[], userId: string) {
  const index = list.findIndex((r) => r.userId === userId);
  if (index >= 0) list.splice(index, 1);
  else list.push({ userId, at: new Date().toISOString() });
}

export async function toggleLike(postId: string) {
  const me = await getCurrentUser();
  mutateDb((db) => {
    const post = db.posts.find((p) => p.id === postId);
    if (post) toggleReaction(post.likes, me.id);
  });
  refresh();
}

export async function toggleRepost(postId: string) {
  const me = await getCurrentUser();
  mutateDb((db) => {
    const post = db.posts.find((p) => p.id === postId);
    if (post) toggleReaction(post.reposts, me.id);
  });
  refresh();
}

/** Deletes the viewer's own post and every reply beneath it. */
export async function deletePost(postId: string, goHome: boolean) {
  const me = await getCurrentUser();
  mutateDb((db) => {
    const post = db.posts.find((p) => p.id === postId);
    if (!post || post.authorId !== me.id) return;

    const doomed = new Set([postId]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const p of db.posts) {
        if (p.replyToId && doomed.has(p.replyToId) && !doomed.has(p.id)) {
          doomed.add(p.id);
          grew = true;
        }
      }
    }
    db.posts = db.posts.filter((p) => !doomed.has(p.id));
  });
  refresh();
  if (goHome) redirect("/");
}

export async function toggleFollow(userId: string) {
  const me = await getCurrentUser();
  if (userId === me.id) return;
  mutateDb((db) => {
    if (!db.users.some((u) => u.id === userId)) return;
    const index = db.follows.findIndex((f) => f.followerId === me.id && f.followeeId === userId);
    if (index >= 0) db.follows.splice(index, 1);
    else db.follows.push({ followerId: me.id, followeeId: userId, at: new Date().toISOString() });
  });
  refresh();
}

/** Demo-only sign-in: picks an account with no password. */
export async function switchAccount(userId: string) {
  if (!readDb().users.some((u) => u.id === userId)) return;
  (await cookies()).set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  refresh();
}
