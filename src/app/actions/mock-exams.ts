"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff, requireRole } from "@/lib/require-session";
import { mockExamSchema, assignExamSchema } from "@/lib/validators";

export async function createMockExam(input: unknown) {
  const session = await requireStaff();
  const data = mockExamSchema.parse(input);

  const mockExam = await prisma.mockExam.create({
    data: {
      title: data.title,
      courseId: data.courseId || null,
      durationMinutes: data.durationMinutes,
      createdById: session.user.id,
      sections: {
        create: data.sections.map((section, sIndex) => ({
          title: section.title,
          order: sIndex,
          questions: {
            create: section.questions.map((q, qIndex) => ({
              prompt: q.prompt,
              type: q.type,
              options: JSON.stringify(q.options),
              correctOptionIds: JSON.stringify(q.correctOptionIds),
              marks: q.marks,
              order: qIndex,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/prospector/mock-tests");
  return mockExam;
}

export async function deleteMockExam(id: string) {
  await requireStaff();
  await prisma.mockExam.delete({ where: { id } });
  revalidatePath("/prospector/mock-tests");
  revalidatePath("/student/mock-tests");
}

export async function assignMockExam(mockExamId: string, input: unknown) {
  const session = await requireStaff();
  const data = assignExamSchema.parse(input);

  await prisma.$transaction(
    data.studentIds.map((studentId) =>
      prisma.examAssignment.upsert({
        where: { mockExamId_studentId: { mockExamId, studentId } },
        update: { dueAt: new Date(data.dueAt) },
        create: {
          mockExamId,
          studentId,
          assignedById: session.user.id,
          dueAt: new Date(data.dueAt),
        },
      })
    )
  );

  revalidatePath("/prospector/mock-tests");
  revalidatePath("/student/mock-tests");
}

export async function startExamAttempt(examAssignmentId: string) {
  const session = await requireRole("STUDENT");

  const examAssignment = await prisma.examAssignment.findUnique({
    where: { id: examAssignmentId },
    include: { attempt: true },
  });
  if (!examAssignment || examAssignment.studentId !== session.user.id) {
    throw new Error("Exam assignment not found.");
  }

  if (examAssignment.attempt) return examAssignment.attempt;

  const attempt = await prisma.examAttempt.create({
    data: { examAssignmentId },
  });

  await prisma.examAssignment.update({
    where: { id: examAssignmentId },
    data: { status: "IN_PROGRESS" },
  });

  revalidatePath("/student/mock-tests");
  return attempt;
}

export async function saveExamAnswer(attemptId: string, questionId: string, selectedOptionIds: string[]) {
  const session = await requireRole("STUDENT");

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: { examAssignment: true },
  });
  if (!attempt || attempt.examAssignment.studentId !== session.user.id) {
    throw new Error("Attempt not found.");
  }
  if (attempt.status !== "IN_PROGRESS") throw new Error("This attempt is no longer active.");

  await prisma.examAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    update: { selectedOptionIds: JSON.stringify(selectedOptionIds) },
    create: { attemptId, questionId, selectedOptionIds: JSON.stringify(selectedOptionIds) },
  });
}

export async function submitExamAttempt(attemptId: string) {
  const session = await requireRole("STUDENT");

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      examAssignment: true,
      answers: true,
    },
  });
  if (!attempt || attempt.examAssignment.studentId !== session.user.id) {
    throw new Error("Attempt not found.");
  }

  const mockExam = await prisma.mockExam.findUnique({
    where: { id: attempt.examAssignment.mockExamId },
    include: { sections: { include: { questions: true } } },
  });
  if (!mockExam) throw new Error("Exam not found.");

  const questions = mockExam.sections.flatMap((s) => s.questions);
  const answerByQuestion = new Map(attempt.answers.map((a) => [a.questionId, a]));

  let score = 0;
  let totalMarks = 0;

  for (const question of questions) {
    totalMarks += question.marks;
    const correct: string[] = JSON.parse(question.correctOptionIds);
    const answer = answerByQuestion.get(question.id);
    const selected: string[] = answer ? JSON.parse(answer.selectedOptionIds) : [];

    const isCorrect =
      selected.length === correct.length && correct.every((id) => selected.includes(id));

    if (isCorrect) score += question.marks;

    if (answer) {
      await prisma.examAnswer.update({ where: { id: answer.id }, data: { isCorrect } });
    }
  }

  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: { status: "GRADED", score, totalMarks, submittedAt: new Date() },
  });

  await prisma.examAssignment.update({
    where: { id: attempt.examAssignmentId },
    data: { status: "GRADED" },
  });

  revalidatePath("/student/mock-tests");
  return { score, totalMarks };
}
