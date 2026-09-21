/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a minimal self-contained server bundle (.next/standalone).
  // Unnecessary but harmless on Vercel; required for Docker/Railway/Render/
  // Fly.io-style deployments that run `node server.js` themselves.
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
