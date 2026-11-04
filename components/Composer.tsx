"use client";

import { useActionState, useRef, useState } from "react";
import { createPost } from "@/app/actions";
import { Avatar } from "./Avatar";
import { countChars, MAX_POST_LENGTH, type ActionResult, type User } from "@/lib/types";

export function Composer({
  user,
  replyToId,
  placeholder = "What's happening?",
  submitLabel = "Post",
}: {
  user: User;
  replyToId?: string;
  placeholder?: string;
  submitLabel?: string;
}) {
  const [text, setText] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => {
      const result = await createPost(formData);
      if (!result.error) setText("");
      return result;
    },
    {},
  );

  const remaining = MAX_POST_LENGTH - countChars(text);
  const canSubmit = text.trim().length > 0 && remaining >= 0 && !pending;

  return (
    <form ref={formRef} action={formAction} className="composer">
      <Avatar user={user} />
      <div className="composer-body">
        {replyToId && <input type="hidden" name="replyToId" value={replyToId} />}
        <textarea
          name="text"
          rows={2}
          value={text}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSubmit) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
        />
        {state.error && (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        )}
        <div className="composer-footer">
          <span className={`char-count${remaining < 0 ? " over" : remaining <= 20 ? " near" : ""}`}>
            {remaining}
          </span>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {pending ? "Posting…" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
