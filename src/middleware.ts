import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;

    const roleForPath: Record<string, string> = {
      "/admin": "ADMIN",
      "/prospector": "PROSPECTOR",
      "/student": "STUDENT",
    };

    const matchedPrefix = Object.keys(roleForPath).find((p) => path.startsWith(p));
    if (matchedPrefix && role !== roleForPath[matchedPrefix] && role !== "ADMIN") {
      const fallback =
        role === "PROSPECTOR" ? "/prospector" : role === "STUDENT" ? "/student" : "/login";
      return NextResponse.redirect(new URL(fallback, req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/student/:path*", "/prospector/:path*", "/admin/:path*"],
};
