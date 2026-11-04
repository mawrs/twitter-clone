import type { NextConfig } from "next";

// cacheComponents and partialPrefetching are left off on purpose. Every page is
// personalized from the session cookie, so there is no static shell to prerender.
const nextConfig: NextConfig = {};

export default nextConfig;
