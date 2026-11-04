import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty">
      <h1>Page not found</h1>
      <p>That post or profile doesn&apos;t exist, or it may have been deleted.</p>
      <p>
        <Link className="inline-link" href="/">
          Back to Home
        </Link>
      </p>
    </div>
  );
}
