"use server";

import { prisma } from "@/lib/prisma";
import { enquirySchema } from "@/lib/validators";

export type EnquiryFormState = {
  success: boolean;
  message: string;
};

export async function submitEnquiry(
  _prevState: EnquiryFormState,
  formData: FormData
): Promise<EnquiryFormState> {
  const parsed = enquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    message: formData.get("message"),
    source: formData.get("source") || "CONTACT",
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.enquiry.create({ data: parsed.data });

  return {
    success: true,
    message: "Thank you! We've received your message and will be in touch shortly.",
  };
}
