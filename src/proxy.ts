import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function (request: NextRequest) {
  const token = request.cookies.get("admin_token"); // Giả sử dùng cookie

  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.includes("/login")
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  return NextResponse.next();
}
