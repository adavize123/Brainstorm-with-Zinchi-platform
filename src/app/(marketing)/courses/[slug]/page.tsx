import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, BarChart3, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const course = await prisma.course.findUnique({ where: { slug: params.slug } });
  if (!course) return {};
  return { title: course.title, description: course.description };
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: { materials: true },
  });

  if (!course || !course.isPublished) notFound();

  return (
    <div className="container py-14 max-w-3xl">
      <FadeIn>
        <Badge variant="secondary">{course.category}</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mt-3">{course.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.durationWeeks} weeks</span>
          <span className="flex items-center gap-1"><BarChart3 className="h-4 w-4" /> {course.level}</span>
        </div>
        <p className="mt-6 text-muted-foreground leading-relaxed">{course.description}</p>

        {course.materials.length > 0 && (
          <div className="mt-8">
            <h2 className="font-semibold mb-3">What you&apos;ll study</h2>
            <ul className="space-y-2">
              {course.materials.map((m) => (
                <li key={m.id} className="rounded-lg border px-4 py-3 text-sm">
                  {m.title}
                  <span className="ml-2 text-xs text-muted-foreground">({m.type})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button asChild size="lg" className="mt-8">
          <Link href="/apply">
            Apply for this course <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </FadeIn>
    </div>
  );
}
