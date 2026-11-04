import { Composer } from "@/components/Composer";
import { PostCard } from "@/components/PostCard";
import { Tabs } from "@/components/Tabs";
import { getCurrentUser, getHomeTimeline } from "@/lib/queries";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { tab } = await searchParams;
  const active = tab === "following" ? "following" : "all";
  const me = await getCurrentUser();
  const items = getHomeTimeline(me, active);

  return (
    <>
      <header className="column-header">
        <h1>Home</h1>
      </header>
      <Tabs
        tabs={[
          { href: "/", label: "For you", active: active === "all" },
          { href: "/?tab=following", label: "Following", active: active === "following" },
        ]}
      />
      <Composer user={me} />
      {items.length === 0 ? (
        <p className="empty">
          {active === "following"
            ? "Nothing here yet. Follow some people to fill this feed."
            : "No posts yet. Be the first!"}
        </p>
      ) : (
        items.map((item) => <PostCard key={item.key} post={item.post} repostedBy={item.repostedBy} />)
      )}
    </>
  );
}
