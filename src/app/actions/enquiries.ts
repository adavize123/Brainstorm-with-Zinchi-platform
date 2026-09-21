"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireStaff, requireRole } from "@/lib/require-session";
import { createStudentSchema } from "@/lib/validators";

export async function updateEnquiryStatus(id: string, status: string) {
  await requireStaff();
  await prisma.enquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/enquiries");
}

export async function convertEnquiryToStudent(enquiryId: string, input: unknown) {
  const session = await requireRole("ADMIN");
  const data = createStudentSchema.parse(input);

  const enquiry = await prisma.enquiry.findUniqueOrThrow({ where: { id: enquiryId } });

  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) throw new Error("A user with this email already exists.");

  const passwordHash = await bcrypt.hash(data.password, 10);
  const student = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        phone: data.phone,
        role: "STUDENT",
        createdById: session.user.id,
      },
    });
    await tx.enquiry.update({ where: { id: enquiry.id }, data: { status: "CONVERTED" } });
    return created;
  });

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin/students");
  revalidatePath("/prospector/students");
  return student;
}
