import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import "./globals.css";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import { Trending, WhoToFollow } from "@/components/Discover";
import { LogoIcon } from "@/components/Icons";
import { Nav } from "@/components/Nav";
import { getAllUsers, getCurrentUser, getTrending, getWhoToFollow } from "@/lib/queries";

export const metadata: Metadata = {
  title: { default: "Chirp", template: "%s / Chirp" },
  description: "A small social feed built with Next.js and React.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const me = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <Link href="/" className="logo" aria-label="Chirp home">
              <LogoIcon />
            </Link>
            <Nav handle={me.handle} />
            <AccountSwitcher current={me} users={getAllUsers()} />
          </aside>

          <main className="column">{children}</main>

          <aside className="discover">
            <Form action="/search" className="search-form">
              <input name="q" type="search" placeholder="Search" aria-label="Search" />
            </Form>
            <Trending items={getTrending()} />
            <WhoToFollow users={getWhoToFollow(me)} />
          </aside>
        </div>
      </body>
    </html>
  );
}
