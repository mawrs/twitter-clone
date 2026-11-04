import type { Metadata } from "next";
import Form from "next/form";
import { Trending, UserRow, WhoToFollow } from "@/components/Discover";
import { FollowButton } from "@/components/FollowButton";
import { PostCard } from "@/components/PostCard";
import { getCurrentUser, getTrending, getWhoToFollow, search } from "@/lib/queries";

export const metadata: Metadata = { title: "Explore" };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim();
  const me = await getCurrentUser();
  const results = search(q, me);
  const noResults = q && results.users.length === 0 && results.posts.length === 0;

  return (
    <>
      <header className="column-header">
        <h1>{q ? `Results for “${q}”` : "Explore"}</h1>
      </header>
      {/* The sidebar has a search box on wide screens; this one covers narrow ones. */}
      <Form action="/search" className="search-form search-form-page">
        <input key={q} name="q" type="search" defaultValue={q} placeholder="Search" aria-label="Search" />
      </Form>

      {!q && (
        <div className="explore-panels">
          <Trending items={getTrending(10)} />
          <WhoToFollow users={getWhoToFollow(me, 5)} />
        </div>
      )}

      {noResults && <p className="empty">No results. Try a different word.</p>}

      {results.users.length > 0 && (
        <section>
          <h2 className="section-title">People</h2>
          {results.users.map(({ user, isMe, isFollowing }) => (
            <div key={user.id} className="list-row">
              <UserRow
                user={user}
                action={isMe ? undefined : <FollowButton userId={user.id} following={isFollowing} />}
              />
            </div>
          ))}
        </section>
      )}

      {results.posts.length > 0 && (
        <section>
          <h2 className="section-title">Posts</h2>
          {results.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      )}
    </>
  );
}
