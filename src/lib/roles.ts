export const ROLES = ["STUDENT", "PROSPECTOR", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export function dashboardPathFor(role: string) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "PROSPECTOR":
      return "/prospector";
    default:
      return "/student";
  }
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
