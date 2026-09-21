"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-session";
import { createProspectorSchema } from "@/lib/validators";

async function assertIsProspector(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== "PROSPECTOR") throw new Error("Prospector not found.");
}

export async function createProspector(input: unknown) {
  const session = await requireRole("ADMIN");
  const data = createProspectorSchema.parse(input);

  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) throw new Error("A user with this email already exists.");

  const passwordHash = await bcrypt.hash(data.password, 10);
  const prospector = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      phone: data.phone,
      role: "PROSPECTOR",
      createdById: session.user.id,
    },
  });

  revalidatePath("/admin/prospectors");
  return prospector;
}

export async function updateProspector(id: string, input: { name: string; phone?: string }) {
  await requireRole("ADMIN");
  await assertIsProspector(id);
  await prisma.user.update({ where: { id }, data: { name: input.name, phone: input.phone } });
  revalidatePath("/admin/prospectors");
}

export async function deleteProspector(id: string) {
  await requireRole("ADMIN");
  await assertIsProspector(id);
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/prospectors");
}
