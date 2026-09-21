"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-session";
import { courseSchema } from "@/lib/validators";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCourse(input: unknown) {
  const session = await requireStaff();
  const data = courseSchema.parse(input);

  let slug = slugify(data.title);
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const course = await prisma.course.create({
    data: { ...data, slug, imageUrl: data.imageUrl || null, createdById: session.user.id },
  });

  revalidatePath("/prospector/courses");
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  return course;
}

export async function updateCourse(id: string, input: unknown) {
  await requireStaff();
  const data = courseSchema.parse(input);
  await prisma.course.update({ where: { id }, data: { ...data, imageUrl: data.imageUrl || null } });

  revalidatePath("/prospector/courses");
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function deleteCourse(id: string) {
  await requireStaff();
  await prisma.course.delete({ where: { id } });

  revalidatePath("/prospector/courses");
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function enrollStudents(courseId: string, studentIds: string[]) {
  const session = await requireStaff();
  await prisma.$transaction(
    studentIds.map((studentId) =>
      prisma.enrollment.upsert({
        where: { studentId_courseId: { studentId, courseId } },
        update: {},
        create: { studentId, courseId, assignedById: session.user.id },
      })
    )
  );

  revalidatePath("/prospector/courses");
  revalidatePath(`/prospector/students`);
  revalidatePath("/student/courses");
}

export async function unenrollStudent(courseId: string, studentId: string) {
  await requireStaff();
  await prisma.enrollment.delete({ where: { studentId_courseId: { studentId, courseId } } });
  revalidatePath("/prospector/courses");
  revalidatePath("/student/courses");
}
