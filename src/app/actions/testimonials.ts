"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-session";

const testimonialSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.string().min(2).max(100),
  quote: z.string().min(10).max(1000),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  isPublished: z.boolean().default(true),
  order: z.coerce.number().int().min(0).default(0),
});

export async function createTestimonial(input: unknown) {
  await requireRole("ADMIN");
  const data = testimonialSchema.parse(input);

  const testimonial = await prisma.testimonial.create({
    data: { ...data, avatarUrl: data.avatarUrl || null },
  });

  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");
  return testimonial;
}

export async function updateTestimonial(id: string, input: unknown) {
  await requireRole("ADMIN");
  const data = testimonialSchema.parse(input);

  await prisma.testimonial.update({
    where: { id },
    data: { ...data, avatarUrl: data.avatarUrl || null },
  });

  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");
}

export async function deleteTestimonial(id: string) {
  await requireRole("ADMIN");
  await prisma.testimonial.delete({ where: { id } });

  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");
}
