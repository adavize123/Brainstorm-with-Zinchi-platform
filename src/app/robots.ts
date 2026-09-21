import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/student", "/prospector", "/admin", "/api"],
    },
    sitemap: "https://brainstorm.zinchi.org/sitemap.xml",
  };
}
