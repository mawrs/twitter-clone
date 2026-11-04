import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Composer } from "@/components/Composer";
import { FocusedPost, PostCard } from "@/components/PostCard";
import { getCurrentUser, getThread } from "@/lib/queries";

export const metadata: Metadata = { title: "Post" };

export default async function PostPage({ params }: PageProps<"/post/[id]">) {
  const { id } = await params;
  const me = await getCurrentUser();
  const thread = getThread(id, me);
  if (!thread) notFound();

  return (
    <>
      <header className="column-header">
        <h1>Post</h1>
      </header>
      {thread.ancestors.map((post) => (
        // Deleting a parent also deletes this post, so leave the page.
        <PostCard key={post.id} post={post} connected deleteGoesHome />
      ))}
      <FocusedPost post={thread.post} />
      <Composer
        user={me}
        replyToId={thread.post.id}
        placeholder="Post your reply"
        submitLabel="Reply"
      />
      {thread.replies.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}
