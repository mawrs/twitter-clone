import type { User } from "@/lib/types";

export function Avatar({ user, size = 40 }: { user: User; size?: number }) {
  return (
    <span
      className="avatar"
      style={{ background: user.color, width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {user.name.charAt(0).toUpperCase()}
    </span>
  );
}
