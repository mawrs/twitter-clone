import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { FollowButton } from "@/components/FollowButton";
import { PostCard } from "@/components/PostCard";
import { Tabs } from "@/components/Tabs";
import { formatMonthYear } from "@/lib/format";
import { getCurrentUser, getProfile, type ProfileTab } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/u/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  return { title: `@${handle}` };
}

export default async function ProfilePage({ params, searchParams }: PageProps<"/u/[handle]">) {
  const { handle } = await params;
  const { tab } = await searchParams;
  const active: ProfileTab = tab === "replies" || tab === "likes" ? tab : "posts";

  const me = await getCurrentUser();
  const profile = getProfile(handle, me, active);
  if (!profile) notFound();

  const { user } = profile;
  const base = `/u/${user.handle}`;

  return (
    <>
      <header className="column-header">
        <h1>{user.name}</h1>
        <p className="muted">
          {profile.postCount} {profile.postCount === 1 ? "post" : "posts"}
        </p>
      </header>
      <div className="profile-banner" style={{ background: user.color }} />
      <section className="profile">
        <div className="profile-top">
          <span className="profile-avatar">
            <Avatar user={user} size={96} />
          </span>
          {!profile.isMe && <FollowButton userId={user.id} following={profile.isFollowing} />}
        </div>
        <h2>{user.name}</h2>
        <p className="muted">@{user.handle}</p>
        <p className="profile-bio">{user.bio}</p>
        <p className="muted">Joined {formatMonthYear(user.joinedAt)}</p>
        <p className="profile-stats">
          <span>
            <strong>{profile.followingCount}</strong> <span className="muted">Following</span>
          </span>
          <span>
            <strong>{profile.followerCount}</strong>{" "}
            <span className="muted">{profile.followerCount === 1 ? "Follower" : "Followers"}</span>
          </span>
        </p>
      </section>
      <Tabs
        tabs={[
          { href: base, label: "Posts", active: active === "posts" },
          { href: `${base}?tab=replies`, label: "Replies", active: active === "replies" },
          { href: `${base}?tab=likes`, label: "Likes", active: active === "likes" },
        ]}
      />
      {profile.items.length === 0 ? (
        <p className="empty">Nothing to show here yet.</p>
      ) : (
        profile.items.map((item) => (
          <PostCard key={item.key} post={item.post} repostedBy={item.repostedBy} />
        ))
      )}
    </>
  );
}
