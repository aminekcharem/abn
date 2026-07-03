import { NextResponse } from "next/server";

import { auth } from "@/auth";

export default auth((request) => {
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (isLoginPage) {
    return NextResponse.next();
  }

  if (!request.auth) {
    const loginUrl = new URL("/admin/login", request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
