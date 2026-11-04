"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="empty" role="alert">
      <h1>Something went wrong</h1>
      <p>That didn&apos;t work. Please try again.</p>
      <p>
        <button type="button" className="btn btn-outline" onClick={reset}>
          Try again
        </button>
      </p>
    </div>
  );
}
