import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export class UnauthorizedError extends Error {
  constructor(message = "Not authorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new UnauthorizedError("You must be signed in.");
  return session;
}

export async function requireRole(...roles: string[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    throw new UnauthorizedError("You do not have permission to perform this action.");
  }
  return session;
}

export async function requireStaff() {
  return requireRole("PROSPECTOR", "ADMIN");
}
