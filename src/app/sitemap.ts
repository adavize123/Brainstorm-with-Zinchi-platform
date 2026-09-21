import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://brainstorm.zinchi.org";

  const staticRoutes = ["", "/courses", "/about", "/testimonials", "/faq", "/contact", "/apply", "/login", "/register"].map(
    (path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
    })
  );

  const courses = await prisma.course.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } });
  const courseRoutes = courses.map((c) => ({
    url: `${baseUrl}/courses/${c.slug}`,
    lastModified: c.updatedAt,
  }));

  return [...staticRoutes, ...courseRoutes];
}
