"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-session";
import { materialSchema, assignMaterialSchema } from "@/lib/validators";

export async function createMaterial(input: unknown) {
  const session = await requireStaff();
  const data = materialSchema.parse(input);

  const material = await prisma.material.create({
    data: { ...data, url: data.url || null, createdById: session.user.id },
  });

  revalidatePath("/prospector/materials");
  revalidatePath("/student/materials");
  revalidatePath(`/student/courses/${data.courseId}`);
  return material;
}

export async function deleteMaterial(id: string) {
  await requireStaff();
  await prisma.material.delete({ where: { id } });
  revalidatePath("/prospector/materials");
  revalidatePath("/student/materials");
}

export async function assignMaterial(materialId: string, input: unknown) {
  const session = await requireStaff();
  const data = assignMaterialSchema.parse(input);

  const material = await prisma.material.findUnique({
    where: { id: materialId },
    include: { course: true },
  });
  if (!material) throw new Error("Material not found.");

  const students = await prisma.user.findMany({
    where: { id: { in: data.studentIds }, role: "STUDENT" },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: material.courseId, studentId: { in: data.studentIds } },
    select: { studentId: true },
  });
  const enrolledIds = new Set(enrollments.map((e) => e.studentId));

  const notEnrolled = students.filter((s) => !enrolledIds.has(s.id));
  if (notEnrolled.length > 0) {
    const names = notEnrolled.map((s) => s.name).join(", ");
    throw new Error(
      `${names} ${notEnrolled.length === 1 ? "is" : "are"} not enrolled in "${material.course.title}" — a student must apply for and be enrolled in this course category before materials can be assigned to them.`
    );
  }

  await prisma.$transaction(
    data.studentIds.map((studentId) =>
      prisma.materialAssignment.upsert({
        where: { materialId_studentId: { materialId, studentId } },
        update: {},
        create: { materialId, studentId, assignedById: session.user.id },
      })
    )
  );

  revalidatePath("/prospector/materials");
  revalidatePath("/student/materials");
  revalidatePath(`/student/courses/${material.courseId}`);
}

export async function unassignMaterial(materialId: string, studentId: string) {
  await requireStaff();
  await prisma.materialAssignment.delete({
    where: { materialId_studentId: { materialId, studentId } },
  });
  revalidatePath("/prospector/materials");
  revalidatePath("/student/materials");
}
