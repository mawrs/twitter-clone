export const MAX_POST_LENGTH = 280;

/** Counts code points so an emoji doesn't use up two characters. */
export function countChars(text: string) {
  return [...text].length;
}

export type User = {
  id: string;
  handle: string;
  name: string;
  bio: string;
  color: string;
  joinedAt: string;
};

export type Reaction = { userId: string; at: string };

export type Post = {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
  replyToId: string | null;
  likes: Reaction[];
  reposts: Reaction[];
};

export type Follow = { followerId: string; followeeId: string; at: string };

export type DB = { users: User[]; posts: Post[]; follows: Follow[] };

export type PostView = {
  id: string;
  text: string;
  createdAt: string;
  author: User;
  replyTo: { id: string; handle: string } | null;
  likeCount: number;
  liked: boolean;
  repostCount: number;
  reposted: boolean;
  replyCount: number;
  isMine: boolean;
};

export type TimelineItem = {
  key: string;
  post: PostView;
  repostedBy: { name: string; handle: string } | null;
};

export type Notification = {
  key: string;
  kind: "like" | "repost" | "reply" | "mention" | "follow";
  actor: User;
  at: string;
  post: PostView | null;
};

export type ActionResult = { error?: string };
