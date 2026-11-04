"use client";

import { useTransition } from "react";
import { switchAccount } from "@/app/actions";
import { Avatar } from "./Avatar";
import type { User } from "@/lib/types";

export function AccountSwitcher({ current, users }: { current: User; users: User[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <label className={`account${pending ? " pending" : ""}`}>
      <Avatar user={current} />
      <span className="account-text">
        <strong className="truncate">{current.name}</strong>
        <span className="muted truncate">@{current.handle}</span>
      </span>
      <span className="sr-only">Switch demo account</span>
      <select
        value={current.id}
        disabled={pending}
        onChange={(e) => {
          const id = e.target.value;
          startTransition(() => switchAccount(id));
        }}
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} (@{u.handle})
          </option>
        ))}
      </select>
    </label>
  );
}
