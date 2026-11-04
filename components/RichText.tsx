import Link from "next/link";

const TOKEN = /(https?:\/\/[^\s]+|(?<![\w#@])#[\p{L}\p{N}_]+|(?<![\w#@])@\w+)/gu;

/** Turns URLs, hashtags and mentions into links. Everything else stays plain text. */
export function RichText({ text }: { text: string }) {
  // split() with a capture group puts the matches at the odd indexes.
  return text.split(TOKEN).map((part, i) => {
    if (i % 2 === 0) return part;
    if (part.startsWith("#")) {
      return (
        <Link key={i} className="inline-link" href={`/search?q=${encodeURIComponent(part)}`}>
          {part}
        </Link>
      );
    }
    if (part.startsWith("@")) {
      return (
        <Link key={i} className="inline-link" href={`/u/${part.slice(1)}`}>
          {part}
        </Link>
      );
    }
    return (
      <a key={i} className="inline-link" href={part} target="_blank" rel="noopener noreferrer nofollow">
        {part}
      </a>
    );
  });
}
