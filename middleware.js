import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const locales = ["en"];
const testPagePath = (pages, pathname) => {
  const pathnameRegex = new RegExp(`^(/(${locales.join("|")}))?(${pages.join("|")})?$`, "i");
  return pathnameRegex.test(pathname);
};

const adminPath = ["/admin.*"];

const authMiddleware = withAuth(
  function onSuccess(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
    pages: {
      signIn: "/",
    },
  }
);
export default async function middleware(request) {
  //admin test
  const token = await getToken({ req: request });
  if (testPagePath(adminPath, request.nextUrl.pathname)) {
    if (token?.user_role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (token && request.nextUrl.pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  if (token && request.nextUrl.pathname === "/") {
    if (token?.user_role === "USER") {
      return NextResponse.redirect(new URL("/reports", request.url));
    }
    if (token?.user_role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  //user login test
  return authMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|robots.txt).*)"],
};
