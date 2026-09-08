import { NextResponse } from "next/server"; // Import NextResponse, a utility from Next.js used to control the response (like redirecting users).

// The 'middleware' function runs automatically on the server BEFORE a request is completed.
// This is great for checking if a user is logged in before letting them see private pages.
export async function middleware(request) {
  // Extract the 'pathname' (the URL path, like '/dashboard') from the incoming request.
  const { pathname } = request.nextUrl;
  
  // Create an array of routes that we want to keep private (only for logged-in users).
  const protectedRoutes = ["/dashboard", "/join", "/admin"];
  
  // Check if the user's current URL starts with any of our protected routes.
  // We use .some() which returns true if ANY of the conditions match.
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route) // Example: if pathname is "/dashboard/settings", it starts with "/dashboard"
  );

  // If the user is trying to access a private page...
  if (isProtectedRoute) {
    // 1. Try to find the authentication cookie (a small piece of data saved in the browser).
    // better-auth uses "better-auth.session_token" locally, and "__Secure-..." in production (HTTPS).
    const sessionCookie = 
      request.cookies.get("better-auth.session_token") || 
      request.cookies.get("__Secure-better-auth.session_token");
      
    // If the cookie is missing completely, the user is definitely not logged in.
    if (!sessionCookie) {
      // Redirect them to the sign-in page, and remember where they originally wanted to go (request.url).
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    
    // 2. Even if the cookie exists, it might be expired or invalid. 
    // We double-check with the backend API to make sure the session is still good.
    try {
      // We send a request to our own API to get the current session.
      const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
        headers: {
          cookie: request.headers.get("cookie") || "", // Pass the user's cookies along to the API.
        },
      });
      
      // Parse the response into JSON format.
      const session = await response.json();
      
      // If the API says there is no valid session...
      if (!session) {
        // Redirect them to the sign-in page.
        return NextResponse.redirect(new URL("/auth/signin", request.url));
      }
    } catch (error) {
      // If the API call fails (for example, if the network is down), we log the error.
      // We don't block the user in this specific case, because the cookie is still present.
      console.error("Middleware session check failed:", error);
    }
  }
  
  // If the page is not protected, OR if the user successfully passed all the checks above,
  // allow the request to continue normally.
  return NextResponse.next();
}

// The 'config' object tells Next.js exactly WHICH URLs this middleware should run on.
// This is for performance optimization, so it doesn't run on images or API routes unnecessarily.
export const config = {
  // The 'matcher' array uses regex-like syntax.
  // "/dashboard/:path*" means run on "/dashboard" and anything inside it like "/dashboard/settings".
  matcher: ["/dashboard/:path*", "/join/:path*", "/admin/:path*"],
};
