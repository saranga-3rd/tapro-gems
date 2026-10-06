import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, LOCALE_COOKIE } from "@/lib/i18n/config";

/**
 * English lives at unprefixed URLs, Finnish/Swedish under /fi and /sv. All pages are built under
 * app/[lang], so unprefixed requests are rewritten to /en internally.
 *  - /en/...       -> 308 to the unprefixed URL (one URL per page)
 *  - /fi/..., /sv/... -> served as is
 *  - unprefixed    -> redirected to the visitor's saved language (cookie), otherwise English
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first, ...rest] = pathname.split("/");

  if (first === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${rest.join("/")}`;
    return NextResponse.redirect(url, 308);
  }

  if (hasLocale(first)) return NextResponse.next();

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (hasLocale(saved) && saved !== defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${saved}` : `/${saved}${pathname}`;
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API routes, Next internals and any file with an extension.
  matcher: ["/((?!api|_next|.*[.]).*)"],
};
