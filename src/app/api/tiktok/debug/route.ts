import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  const rawAccessToken = cookieStore.get("tiktok_access_token")?.value;
  const refreshToken = cookieStore.get("tiktok_refresh_token")?.value;
  const openId = cookieStore.get("tiktok_open_id")?.value;

  // Try to decode if encoded
  let accessToken = rawAccessToken;
  try {
    if (rawAccessToken) {
      accessToken = decodeURIComponent(rawAccessToken);
    }
  } catch {
    // Not encoded
  }

  const testCookie = cookieStore.get("tiktok_test")?.value;

  return NextResponse.json({
    hasAccessToken: !!accessToken,
    accessTokenLength: accessToken?.length || 0,
    accessTokenPreview: accessToken ? accessToken.slice(0, 30) + "..." : null,
    rawAccessTokenPreview: rawAccessToken ? rawAccessToken.slice(0, 30) + "..." : null,
    hasRefreshToken: !!refreshToken,
    refreshTokenPreview: refreshToken ? refreshToken.slice(0, 20) + "..." : null,
    hasOpenId: !!openId,
    openId: openId,
    testCookie: testCookie,
    allCookieNames: cookieStore.getAll().map(c => c.name),
  });
}
