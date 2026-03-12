export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/log/:path*", "/scale/:path*", "/analytics/:path*", "/settings/:path*"],
};
