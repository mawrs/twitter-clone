import type { ReactNode } from "react";

function Icon({ children, filled }: { children: ReactNode; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1.25em"
      height="1.25em"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

type Props = { filled?: boolean };

export const LogoIcon = () => (
  <Icon filled>
    <path d="M12 3c-5 0-9 3.4-9 7.8 0 2.4 1.2 4.5 3.1 5.9L5 21l4.8-2.5c.7.1 1.4.2 2.2.2 5 0 9-3.5 9-7.9S17 3 12 3z" />
  </Icon>
);
export const HomeIcon = ({ filled }: Props) => (
  <Icon filled={filled}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </Icon>
);
export const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.8-3.8" />
  </Icon>
);
export const BellIcon = ({ filled }: Props) => (
  <Icon filled={filled}>
    <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Icon>
);
export const UserIcon = ({ filled }: Props) => (
  <Icon filled={filled}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0z" />
  </Icon>
);
export const ReplyIcon = () => (
  <Icon>
    <path d="M21 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-5A8 8 0 1 1 21 11.5z" />
  </Icon>
);
export const RepostIcon = () => (
  <Icon>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11V9a3 3 0 0 1 3-3h15" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v2a3 3 0 0 1-3 3H3" />
  </Icon>
);
export const HeartIcon = ({ filled }: Props) => (
  <Icon filled={filled}>
    <path d="M12 20.5s-8.5-5-8.5-11A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 2.9c0 6-8.5 11-8.5 11z" />
  </Icon>
);
export const TrashIcon = () => (
  <Icon>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" />
  </Icon>
);
