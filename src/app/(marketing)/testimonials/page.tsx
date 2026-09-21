import { prisma } from "@/lib/prisma";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Hear from students and families who have worked with Zinchi International.",
};

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="container py-14">
      <FadeIn>
        <h1 className="text-3xl md:text-4xl font-bold">Testimonials</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Real stories from students and families who brainstormed their way to success with Zinchi.
        </p>
      </FadeIn>

      <StaggerGroup className="mt-10 grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <StaggerItem key={t.id}>
            <TestimonialCard testimonial={t} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
