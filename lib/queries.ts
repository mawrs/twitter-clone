import { cookies } from "next/headers";
import { readDb } from "./db";
import type { DB, Notification, Post, PostView, TimelineItem, User } from "./types";

export const SESSION_COOKIE = "demo_user_id";

const HASHTAG = /(?<![\w#])#[\p{L}\p{N}_]+/gu;
const byNewest = (a: { at: string }, b: { at: string }) => b.at.localeCompare(a.at);

export async function getCurrentUser(db: DB = readDb()): Promise<User> {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  return db.users.find((u) => u.id === id) ?? db.users[0];
}

function toView(db: DB, post: Post, viewerId: string): PostView {
  const parent = post.replyToId ? db.posts.find((p) => p.id === post.replyToId) : null;
  const parentAuthor = parent ? db.users.find((u) => u.id === parent.authorId) : null;
  return {
    id: post.id,
    text: post.text,
    createdAt: post.createdAt,
    author: db.users.find((u) => u.id === post.authorId)!,
    replyTo: parent && parentAuthor ? { id: parent.id, handle: parentAuthor.handle } : null,
    likeCount: post.likes.length,
    liked: post.likes.some((l) => l.userId === viewerId),
    repostCount: post.reposts.length,
    reposted: post.reposts.some((r) => r.userId === viewerId),
    replyCount: db.posts.filter((p) => p.replyToId === post.id).length,
    isMine: post.authorId === viewerId,
  };
}

/** Each post appears once, at its most recent original-post or repost time. */
function buildTimeline(db: DB, viewerId: string, includeUser: (userId: string) => boolean) {
  const latest = new Map<string, { at: string; item: TimelineItem }>();
  const consider = (post: Post, at: string, reposterId: string | null) => {
    const existing = latest.get(post.id);
    if (existing && existing.at >= at) return;
    const reposter = reposterId ? db.users.find((u) => u.id === reposterId) : null;
    latest.set(post.id, {
      at,
      item: {
        key: post.id,
        post: toView(db, post, viewerId),
        repostedBy: reposter ? { name: reposter.name, handle: reposter.handle } : null,
      },
    });
  };

  for (const post of db.posts) {
    if (includeUser(post.authorId) && !post.replyToId) consider(post, post.createdAt, null);
    for (const r of post.reposts) {
      if (includeUser(r.userId)) consider(post, r.at, r.userId);
    }
  }
  return [...latest.values()].sort(byNewest).map((e) => e.item);
}

export function getHomeTimeline(viewer: User, tab: "all" | "following") {
  const db = readDb();
  if (tab === "all") return buildTimeline(db, viewer.id, () => true);
  const followed = new Set(
    db.follows.filter((f) => f.followerId === viewer.id).map((f) => f.followeeId),
  );
  followed.add(viewer.id);
  return buildTimeline(db, viewer.id, (id) => followed.has(id));
}

export function getThread(id: string, viewer: User) {
  const db = readDb();
  const post = db.posts.find((p) => p.id === id);
  if (!post) return null;

  const ancestors: PostView[] = [];
  let parentId = post.replyToId;
  while (parentId) {
    const parent = db.posts.find((p) => p.id === parentId);
    if (!parent) break;
    ancestors.unshift(toView(db, parent, viewer.id));
    parentId = parent.replyToId;
  }

  const replies = db.posts
    .filter((p) => p.replyToId === id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((p) => toView(db, p, viewer.id));

  return { post: toView(db, post, viewer.id), ancestors, replies };
}

export type ProfileTab = "posts" | "replies" | "likes";

export function getProfile(handle: string, viewer: User, tab: ProfileTab) {
  const db = readDb();
  const user = db.users.find((u) => u.handle.toLowerCase() === handle.toLowerCase());
  if (!user) return null;

  let items: TimelineItem[];
  if (tab === "posts") {
    items = buildTimeline(db, viewer.id, (id) => id === user.id);
  } else if (tab === "replies") {
    items = db.posts
      .filter((p) => p.authorId === user.id && p.replyToId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((p) => ({ key: p.id, post: toView(db, p, viewer.id), repostedBy: null }));
  } else {
    items = db.posts
      .flatMap((p) => {
        const like = p.likes.find((l) => l.userId === user.id);
        return like ? [{ post: p, at: like.at }] : [];
      })
      .sort(byNewest)
      .map(({ post }) => ({ key: post.id, post: toView(db, post, viewer.id), repostedBy: null }));
  }

  return {
    user,
    items,
    isMe: user.id === viewer.id,
    isFollowing: db.follows.some((f) => f.followerId === viewer.id && f.followeeId === user.id),
    followerCount: db.follows.filter((f) => f.followeeId === user.id).length,
    followingCount: db.follows.filter((f) => f.followerId === user.id).length,
    postCount: db.posts.filter((p) => p.authorId === user.id).length,
  };
}

export function getNotifications(viewer: User): Notification[] {
  const db = readDb();
  const actor = (id: string) => db.users.find((u) => u.id === id)!;
  const out: Notification[] = [];

  for (const post of db.posts) {
    const view = () => toView(db, post, viewer.id);

    if (post.authorId === viewer.id) {
      for (const l of post.likes) {
        if (l.userId === viewer.id) continue;
        out.push({ key: `like-${post.id}-${l.userId}`, kind: "like", actor: actor(l.userId), at: l.at, post: view() });
      }
      for (const r of post.reposts) {
        if (r.userId === viewer.id) continue;
        out.push({ key: `repost-${post.id}-${r.userId}`, kind: "repost", actor: actor(r.userId), at: r.at, post: view() });
      }
    }

    if (post.authorId === viewer.id) continue;
    const parent = post.replyToId ? db.posts.find((p) => p.id === post.replyToId) : null;
    if (parent?.authorId === viewer.id) {
      out.push({ key: `reply-${post.id}`, kind: "reply", actor: actor(post.authorId), at: post.createdAt, post: view() });
    } else if (new RegExp(`(^|[^\\w@])@${viewer.handle}\\b`, "i").test(post.text)) {
      out.push({ key: `mention-${post.id}`, kind: "mention", actor: actor(post.authorId), at: post.createdAt, post: view() });
    }
  }

  for (const f of db.follows) {
    if (f.followeeId !== viewer.id) continue;
    out.push({ key: `follow-${f.followerId}`, kind: "follow", actor: actor(f.followerId), at: f.at, post: null });
  }

  return out.sort(byNewest).slice(0, 50);
}

export function search(query: string, viewer: User) {
  const db = readDb();
  const q = query.trim().toLowerCase();
  if (!q) return { users: [], posts: [] };

  const users = db.users
    .filter((u) => `${u.name} ${u.handle} ${u.bio}`.toLowerCase().includes(q))
    .map((user) => ({
      user,
      isMe: user.id === viewer.id,
      isFollowing: db.follows.some((f) => f.followerId === viewer.id && f.followeeId === user.id),
    }));

  const posts = db.posts
    .filter((p) => p.text.toLowerCase().includes(q))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => toView(db, p, viewer.id));

  return { users, posts };
}

export function getTrending(limit = 5) {
  const counts = new Map<string, number>();
  for (const post of readDb().posts) {
    const tags = new Set((post.text.match(HASHTAG) ?? []).map((t) => t.toLowerCase()));
    for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

export function getWhoToFollow(viewer: User, limit = 3) {
  const db = readDb();
  const followed = new Set(
    db.follows.filter((f) => f.followerId === viewer.id).map((f) => f.followeeId),
  );
  return db.users.filter((u) => u.id !== viewer.id && !followed.has(u.id)).slice(0, limit);
}

export function getAllUsers() {
  return readDb().users;
}
