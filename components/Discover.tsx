import Link from "next/link";
import { Avatar } from "./Avatar";
import { FollowButton } from "./FollowButton";
import type { User } from "@/lib/types";

export function Trending({ items }: { items: { tag: string; count: number }[] }) {
  if (items.length === 0) return null;
  return (
    <section className="panel">
      <h2>Trending</h2>
      {items.map(({ tag, count }) => (
        <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="panel-row trend">
          <strong>{tag}</strong>
          <span className="muted">
            {count} {count === 1 ? "post" : "posts"}
          </span>
        </Link>
      ))}
    </section>
  );
}

export function WhoToFollow({ users }: { users: User[] }) {
  if (users.length === 0) return null;
  return (
    <section className="panel">
      <h2>Who to follow</h2>
      {users.map((user) => (
        <div key={user.id} className="panel-row">
          <UserRow user={user} action={<FollowButton userId={user.id} following={false} />} />
        </div>
      ))}
    </section>
  );
}

export function UserRow({ user, action }: { user: User; action?: React.ReactNode }) {
  return (
    <div className="user-row">
      <Link href={`/u/${user.handle}`} aria-label={user.name}>
        <Avatar user={user} />
      </Link>
      <div className="user-row-text">
        <Link href={`/u/${user.handle}`} className="post-name">
          {user.name}
        </Link>
        <span className="muted truncate">@{user.handle}</span>
      </div>
      {action}
    </div>
  );
}
