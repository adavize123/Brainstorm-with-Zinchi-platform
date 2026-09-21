import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/marketing/course-card";
import { FadeIn } from "@/components/motion";
import { CourseFilters } from "@/components/marketing/course-filters";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse Zinchi International's test-prep and study-abroad courses.",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const category = searchParams.category?.trim() ?? "";

  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
      where: {
        isPublished: true,
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  return (
    <div className="container py-14">
      <FadeIn>
        <h1 className="text-3xl md:text-4xl font-bold">Courses</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Explore Zinchi&apos;s structured programs — from SAT prep to scholarship essay mastery —
          each guided by a dedicated prospector.
        </p>
      </FadeIn>

      <div className="mt-8">
        <Suspense fallback={null}>
          <CourseFilters categories={categories.map((c) => c.category)} />
        </Suspense>
      </div>

      {courses.length > 0 ? (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-muted-foreground">No courses match your search yet.</p>
      )}
    </div>
  );
}
