import { NextResponse, type NextRequest } from "next/server";

// TODO: Add session-based route protection once backend auth is wired up.
// Protected routes: /dashboard, /client, /freelancer
// Auth routes (redirect away if logged in): /signin, /signup
export function proxy(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
