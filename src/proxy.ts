import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard", "/onboarding", "/student", "/mentor", "/admin", "/participate"];

const clerkProxy = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ? clerkMiddleware(async (auth, request) => {
      const path = request.nextUrl.pathname;
      if (protectedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
        await auth.protect({
          unauthenticatedUrl: new URL("/login", request.url).toString(),
        });
      }
    })
  : null;

export default clerkProxy ?? (() => NextResponse.next());

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
