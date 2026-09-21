"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";

const profileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function updateProfile(input: unknown) {
  const session = await requireSession();
  const data = profileSchema.parse(input);
  await prisma.user.update({ where: { id: session.user.id }, data });
  revalidatePath("/student/profile");
}

export async function changePassword(input: unknown) {
  const session = await requireSession();
  const data = passwordSchema.parse(input);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) throw new Error("Current password is incorrect.");

  const passwordHash = await bcrypt.hash(data.newPassword, 10);
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } });
}
