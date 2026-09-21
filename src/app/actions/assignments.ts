"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff, requireRole } from "@/lib/require-session";
import { assignmentSchema, submitAssignmentSchema, gradeAssignmentSchema } from "@/lib/validators";

export async function createAssignment(input: unknown) {
  const session = await requireStaff();
  const data = assignmentSchema.parse(input);

  const assignment = await prisma.assignment.create({
    data: {
      title: data.title,
      description: data.description,
      courseId: data.courseId,
      createdById: session.user.id,
      targets: {
        create: data.studentIds.map((studentId) => ({
          studentId,
          dueAt: new Date(data.dueAt),
        })),
      },
    },
  });

  revalidatePath("/prospector/assignments");
  revalidatePath("/student/assignments");
  return assignment;
}

export async function deleteAssignment(id: string) {
  await requireStaff();
  await prisma.assignment.delete({ where: { id } });
  revalidatePath("/prospector/assignments");
  revalidatePath("/student/assignments");
}

export async function submitAssignment(targetId: string, input: unknown) {
  const session = await requireRole("STUDENT");
  const data = submitAssignmentSchema.parse(input);

  const target = await prisma.assignmentTarget.findUnique({ where: { id: targetId } });
  if (!target || target.studentId !== session.user.id) throw new Error("Assignment not found.");

  const isLate = new Date() > target.dueAt;

  await prisma.assignmentTarget.update({
    where: { id: targetId },
    data: {
      submissionText: data.submissionText || null,
      submissionUrl: data.submissionUrl || null,
      submittedAt: new Date(),
      status: isLate ? "LATE" : "SUBMITTED",
    },
  });

  revalidatePath("/student/assignments");
  revalidatePath("/prospector/assignments");
}

export async function gradeAssignment(targetId: string, input: unknown) {
  await requireStaff();
  const data = gradeAssignmentSchema.parse(input);

  await prisma.assignmentTarget.update({
    where: { id: targetId },
    data: { grade: data.grade, feedback: data.feedback, status: "GRADED" },
  });

  revalidatePath("/prospector/assignments");
  revalidatePath("/student/assignments");
}
