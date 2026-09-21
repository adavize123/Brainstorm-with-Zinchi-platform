import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/marketing/course-card";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";
import { prisma } from "@/lib/prisma";

const stats = [
  { icon: Users, label: "Students Guided", value: "500+" },
  { icon: BookOpen, label: "Courses Delivered", value: "30+" },
  { icon: ClipboardCheck, label: "Mock Exams Taken", value: "2,000+" },
  { icon: Trophy, label: "Scholarships Won", value: "120+" },
];

export default async function HomePage() {
  const [courses, testimonials] = await Promise.all([
    prisma.course.findMany({ where: { isPublished: true }, take: 3, orderBy: { createdAt: "desc" } }),
    prisma.testimonial.findMany({ where: { isPublished: true }, take: 3, orderBy: { order: "asc" } }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden gradient-primary text-white">
        <div className="container py-24 md:py-32 grid gap-10 md:grid-cols-2 items-center">
          <FadeIn>
            <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium mb-4">
              Zinchi International
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
              Brainstorm with Zinchi — your launchpad to global opportunity.
            </h1>
            <p className="mt-5 text-white/80 max-w-lg">
              Test prep, courses, assignments, and mock exams — all in one platform built to
              track your progress and keep you moving toward your goals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/apply">
                  Apply Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white">
                <Link href="/courses">Explore Courses</Link>
              </Button>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-2xl">
              <p className="text-sm text-white/70 mb-4">Where You Stand</p>
              <div className="space-y-3">
                {["Mock Test Average", "Assignments Completed", "Courses In Progress"].map((label, i) => (
                  <div key={label} className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3">
                    <span className="text-sm">{label}</span>
                    <span className="font-semibold">{[78, "12/15", 2][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="container py-14">
        <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="rounded-xl border p-5 text-center">
                <stat.icon className="mx-auto h-6 w-6 text-primary mb-2" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="container py-14">
        <FadeIn>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Courses</h2>
              <p className="text-muted-foreground mt-1">Structured programs guided by experienced prospectors.</p>
            </div>
            <Button asChild variant="link" className="hidden md:inline-flex">
              <Link href="/courses">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </FadeIn>
        {courses.length > 0 ? (
          <StaggerGroup className="grid gap-6 md:grid-cols-3">
            {courses.map((course) => (
              <StaggerItem key={course.id}>
                <CourseCard course={course} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <p className="text-muted-foreground text-sm">Courses will appear here once published.</p>
        )}
      </section>

      {testimonials.length > 0 && (
        <section className="bg-muted/30 py-14">
          <div className="container">
            <FadeIn>
              <h2 className="text-2xl md:text-3xl font-bold mb-8">What Our Students Say</h2>
            </FadeIn>
            <StaggerGroup className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <StaggerItem key={t.id}>
                  <TestimonialCard testimonial={t} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      <section className="container py-16">
        <FadeIn>
          <div className="gradient-primary rounded-2xl text-white p-10 md:p-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold">Ready to start your journey?</h2>
            <p className="mt-3 text-white/80 max-w-xl mx-auto">
              Apply today and get matched with a Zinchi prospector who will guide you every step
              of the way.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-6">
              <Link href="/apply">
                Apply Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
