import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/content?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/content?error=No authorization code received", request.url)
    );
  }

  const clientId = process.env.INSTAGRAM_APP_ID;
  const clientSecret = process.env.INSTAGRAM_APP_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/instagram/callback`;

  try {
    // Exchange code for short-lived token
    const tokenResponse = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code: code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error_message) {
      return NextResponse.redirect(
        new URL(
          `/content?error=${encodeURIComponent(tokenData.error_message)}`,
          request.url
        )
      );
    }

    // Exchange for long-lived token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${tokenData.access_token}`
    );
    const longLivedData = await longLivedResponse.json();

    const accessToken = longLivedData.access_token || tokenData.access_token;
    const userId = tokenData.user_id;

    // Store token in cookie (in production, use a database)
    const cookieStore = await cookies();
    cookieStore.set("instagram_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: "/",
    });
    cookieStore.set("instagram_user_id", userId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 60,
      path: "/",
    });

    return NextResponse.redirect(
      new URL("/content?instagram=connected", request.url)
    );
  } catch (err) {
    console.error("Instagram OAuth error:", err);
    return NextResponse.redirect(
      new URL("/content?error=Failed to authenticate with Instagram", request.url)
    );
  }
}
