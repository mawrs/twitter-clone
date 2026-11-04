import Link from "next/link";

export function Tabs({ tabs }: { tabs: { href: string; label: string; active: boolean }[] }) {
  return (
    <nav className="tabs">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`tab${t.active ? " active" : ""}`}
          aria-current={t.active ? "page" : undefined}
        >
          <span>{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}
