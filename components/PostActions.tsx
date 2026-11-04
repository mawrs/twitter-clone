"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { deletePost, toggleLike, toggleRepost } from "@/app/actions";
import { HeartIcon, ReplyIcon, RepostIcon, TrashIcon } from "./Icons";
import type { PostView } from "@/lib/types";

type Counts = Pick<PostView, "liked" | "likeCount" | "reposted" | "repostCount">;

export function PostActions({ post, deleteGoesHome }: { post: PostView; deleteGoesHome: boolean }) {
  const [, startTransition] = useTransition();
  const [counts, applyOptimistic] = useOptimistic<Counts, "like" | "repost">(
    {
      liked: post.liked,
      likeCount: post.likeCount,
      reposted: post.reposted,
      repostCount: post.repostCount,
    },
    (current, kind) =>
      kind === "like"
        ? {
            ...current,
            liked: !current.liked,
            likeCount: current.likeCount + (current.liked ? -1 : 1),
          }
        : {
            ...current,
            reposted: !current.reposted,
            repostCount: current.repostCount + (current.reposted ? -1 : 1),
          },
  );

  const run = (kind: "like" | "repost") =>
    startTransition(async () => {
      applyOptimistic(kind);
      await (kind === "like" ? toggleLike(post.id) : toggleRepost(post.id));
    });

  return (
    <div className="post-actions">
      <Link href={`/post/${post.id}`} className="action action-reply" aria-label={`Reply, ${post.replyCount} replies`}>
        <ReplyIcon />
        <span>{post.replyCount || ""}</span>
      </Link>
      <button
        type="button"
        className={`action action-repost${counts.reposted ? " active" : ""}`}
        aria-pressed={counts.reposted}
        aria-label={`Repost, ${counts.repostCount} reposts`}
        onClick={() => run("repost")}
      >
        <RepostIcon />
        <span>{counts.repostCount || ""}</span>
      </button>
      <button
        type="button"
        className={`action action-like${counts.liked ? " active" : ""}`}
        aria-pressed={counts.liked}
        aria-label={`Like, ${counts.likeCount} likes`}
        onClick={() => run("like")}
      >
        <HeartIcon filled={counts.liked} />
        <span>{counts.likeCount || ""}</span>
      </button>
      {post.isMine ? <DeleteButton postId={post.id} goHome={deleteGoesHome} /> : <span />}
    </div>
  );
}

function DeleteButton({ postId, goHome }: { postId: string; goHome: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={`action action-delete${confirming ? " active" : ""}`}
      disabled={pending}
      aria-label={confirming ? "Confirm delete" : "Delete post"}
      onBlur={() => setConfirming(false)}
      onClick={() => {
        if (!confirming) return setConfirming(true);
        startTransition(() => deletePost(postId, goHome));
      }}
    >
      <TrashIcon />
      {confirming && <span>{pending ? "Deleting…" : "Delete?"}</span>}
    </button>
  );
}
