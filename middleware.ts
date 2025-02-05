import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export function middleware(req: NextRequest) {
  const token = req.cookies.get("token"); 
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

}

export const config = {
  matcher: ["/","/dashboard/:path*"], // Protege la ruta dashboard
};
