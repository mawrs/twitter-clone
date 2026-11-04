"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, HomeIcon, SearchIcon, UserIcon } from "./Icons";

export function Nav({ handle }: { handle: string }) {
  const pathname = usePathname();
  const profile = `/u/${handle}`;
  const links = [
    { href: "/", label: "Home", icon: HomeIcon, active: pathname === "/" },
    { href: "/search", label: "Explore", icon: SearchIcon, active: pathname === "/search" },
    { href: "/notifications", label: "Notifications", icon: BellIcon, active: pathname === "/notifications" },
    { href: profile, label: "Profile", icon: UserIcon, active: pathname === profile },
  ];

  return (
    <nav className="nav" aria-label="Main">
      {links.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={label}
          href={href}
          className={`nav-link${active ? " active" : ""}`}
          aria-current={active ? "page" : undefined}
          aria-label={label}
        >
          <Icon filled={active} />
          <span className="nav-label">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
