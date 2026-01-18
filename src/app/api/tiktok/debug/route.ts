import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("tiktok_access_token")?.value;
  const refreshToken = cookieStore.get("tiktok_refresh_token")?.value;
  const openId = cookieStore.get("tiktok_open_id")?.value;

  return NextResponse.json({
    hasAccessToken: !!accessToken,
    accessTokenLength: accessToken?.length || 0,
    accessTokenPreview: accessToken ? accessToken.slice(0, 20) + "..." : null,
    hasRefreshToken: !!refreshToken,
    refreshTokenPreview: refreshToken ? refreshToken.slice(0, 20) + "..." : null,
    hasOpenId: !!openId,
    openId: openId,
    allCookieNames: cookieStore.getAll().map(c => c.name),
  });
}
