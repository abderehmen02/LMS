import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware


export default  authMiddleware({
    publicRoutes: ["/api/webhook", "/api/uploadthing"],
    // afterAuth (auth , request ){
    //   const requestHeaders = new Headers(request.headers);
    //   requestHeaders.set('x-url', request.url);
    
    //   return NextResponse.next({
    //     request: {
    //       // Apply new request headers
    //       headers: requestHeaders,
    //     }
    //   });
    // }
  })

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};



