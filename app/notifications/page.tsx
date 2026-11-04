import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { BellIcon, HeartIcon, ReplyIcon, RepostIcon, UserIcon } from "@/components/Icons";
import { formatRelative } from "@/lib/format";
import { getCurrentUser, getNotifications } from "@/lib/queries";
import type { Notification } from "@/lib/types";

export const metadata: Metadata = { title: "Notifications" };

const COPY: Record<Notification["kind"], { text: string; icon: React.ReactNode }> = {
  like: { text: "liked your post", icon: <HeartIcon filled /> },
  repost: { text: "reposted your post", icon: <RepostIcon /> },
  reply: { text: "replied to your post", icon: <ReplyIcon /> },
  mention: { text: "mentioned you", icon: <BellIcon /> },
  follow: { text: "followed you", icon: <UserIcon filled /> },
};

export default async function NotificationsPage() {
  const me = await getCurrentUser();
  const notifications = getNotifications(me);

  return (
    <>
      <header className="column-header">
        <h1>Notifications</h1>
      </header>
      {notifications.length === 0 && <p className="empty">Nothing yet. Check back soon.</p>}
      {notifications.map((n) => {
        const { text, icon } = COPY[n.kind];
        const href = n.post ? `/post/${n.post.id}` : `/u/${n.actor.handle}`;
        return (
          <Link key={n.key} href={href} className={`notification kind-${n.kind}`}>
            <span className="notification-icon">{icon}</span>
            <div className="notification-body">
              <Avatar user={n.actor} size={32} />
              <p>
                <strong>{n.actor.name}</strong> {text}{" "}
                <span className="muted">· {formatRelative(n.at)}</span>
              </p>
              {n.post && <p className="muted notification-post">{n.post.text}</p>}
            </div>
          </Link>
        );
      })}
    </>
  );
}
