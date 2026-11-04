"use client";

import { useOptimistic, useTransition } from "react";
import { toggleFollow } from "@/app/actions";

export function FollowButton({ userId, following }: { userId: string; following: boolean }) {
  const [, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useOptimistic(following);

  return (
    <button
      type="button"
      className={`btn ${isFollowing ? "btn-outline" : "btn-contrast"}`}
      aria-pressed={isFollowing}
      onClick={() =>
        startTransition(async () => {
          setIsFollowing(!isFollowing);
          await toggleFollow(userId);
        })
      }
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
