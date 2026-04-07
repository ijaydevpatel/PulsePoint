import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define Protected Clinical Hubs
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile-setup(.*)'
]);

/**
 * Clerk Neural Identity Middleware
 * Replaces manual layout-level redirects with high-fidelity Edge Route protection.
 * Ensures that unauthenticated pulses are redirected to the Login Portal automatically.
 */
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
