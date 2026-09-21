"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-session";
import { createStudentSchema } from "@/lib/validators";

export async function createStudent(input: unknown) {
  const session = await requireStaff();
  const data = createStudentSchema.parse(input);

  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) throw new Error("A user with this email already exists.");

  const passwordHash = await bcrypt.hash(data.password, 10);
  const student = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      phone: data.phone,
      role: "STUDENT",
      createdById: session.user.id,
    },
  });

  revalidatePath("/prospector/students");
  revalidatePath("/admin/students");
  return student;
}

async function assertIsStudent(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== "STUDENT") throw new Error("Student not found.");
}

export async function updateStudent(id: string, input: { name: string; phone?: string }) {
  await requireStaff();
  await assertIsStudent(id);
  await prisma.user.update({
    where: { id },
    data: { name: input.name, phone: input.phone },
  });
  revalidatePath("/prospector/students");
  revalidatePath("/admin/students");
}

export async function deleteStudent(id: string) {
  await requireStaff();
  await assertIsStudent(id);
  await prisma.user.delete({ where: { id } });
  revalidatePath("/prospector/students");
  revalidatePath("/admin/students");
}
