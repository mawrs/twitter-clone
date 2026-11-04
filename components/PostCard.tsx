import Link from "next/link";
import { Avatar } from "./Avatar";
import { PostActions } from "./PostActions";
import { RichText } from "./RichText";
import { RepostIcon } from "./Icons";
import { formatFull, formatRelative } from "@/lib/format";
import type { PostView } from "@/lib/types";

export function PostCard({
  post,
  repostedBy,
  connected = false,
  deleteGoesHome = false,
}: {
  post: PostView;
  repostedBy?: { name: string; handle: string } | null;
  /** Draws the thread line down to the next post. */
  connected?: boolean;
  /** Deleting this post also removes the page being viewed. */
  deleteGoesHome?: boolean;
}) {
  const { author } = post;
  return (
    <article className={`post${connected ? " post-connected" : ""}`}>
      <Link href={`/post/${post.id}`} className="post-overlay" aria-label={`View post by ${author.name}`} />
      {repostedBy && (
        <p className="post-context">
          <RepostIcon />
          <Link href={`/u/${repostedBy.handle}`}>{repostedBy.name} reposted</Link>
        </p>
      )}
      <div className="post-row">
        <div className="post-gutter">
          <Link href={`/u/${author.handle}`} aria-label={author.name}>
            <Avatar user={author} />
          </Link>
          {connected && <span className="thread-line" />}
        </div>
        <div className="post-main">
          <header className="post-header">
            <Link href={`/u/${author.handle}`} className="post-name">
              {author.name}
            </Link>
            <span className="muted truncate">@{author.handle}</span>
            <span className="muted">·</span>
            <time className="muted" dateTime={post.createdAt} title={formatFull(post.createdAt)}>
              {formatRelative(post.createdAt)}
            </time>
          </header>
          {post.replyTo && (
            <p className="post-replying muted">
              Replying to <Link href={`/u/${post.replyTo.handle}`}>@{post.replyTo.handle}</Link>
            </p>
          )}
          <p className="post-text">
            <RichText text={post.text} />
          </p>
          <PostActions post={post} deleteGoesHome={deleteGoesHome} />
        </div>
      </div>
    </article>
  );
}

/** The larger version of a post at the top of its own page. */
export function FocusedPost({ post }: { post: PostView }) {
  const { author } = post;
  return (
    <article className="post-focused">
      <div className="user-row">
        <Link href={`/u/${author.handle}`} aria-label={author.name}>
          <Avatar user={author} size={48} />
        </Link>
        <div className="user-row-text">
          <Link href={`/u/${author.handle}`} className="post-name">
            {author.name}
          </Link>
          <span className="muted truncate">@{author.handle}</span>
        </div>
      </div>
      {post.replyTo && (
        <p className="post-replying muted">
          Replying to <Link href={`/u/${post.replyTo.handle}`}>@{post.replyTo.handle}</Link>
        </p>
      )}
      <p className="post-text-large">
        <RichText text={post.text} />
      </p>
      <time className="muted post-timestamp" dateTime={post.createdAt}>
        {formatFull(post.createdAt)}
      </time>
      <PostActions post={post} deleteGoesHome />
    </article>
  );
}
