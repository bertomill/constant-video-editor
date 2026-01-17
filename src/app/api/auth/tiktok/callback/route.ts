import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("tiktok_oauth_state")?.value;
  const codeVerifier = cookieStore.get("tiktok_code_verifier")?.value;

  // Clean up OAuth cookies
  cookieStore.delete("tiktok_oauth_state");
  cookieStore.delete("tiktok_code_verifier");

  if (error) {
    console.error("TikTok OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/content?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      new URL("/content?error=Invalid OAuth state", request.url)
    );
  }

  if (!codeVerifier) {
    return NextResponse.redirect(
      new URL("/content?error=Missing code verifier", request.url)
    );
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`
    : "http://localhost:3000/api/auth/tiktok/callback";

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: clientKey!,
        client_secret: clientSecret!,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("TikTok token error:", tokenData);
      return NextResponse.redirect(
        new URL(
          `/content?error=${encodeURIComponent(tokenData.error_description || tokenData.error || "Failed to get token")}`,
          request.url
        )
      );
    }

    // Store tokens in cookies
    cookieStore.set("tiktok_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokenData.expires_in || 86400,
      path: "/",
    });

    if (tokenData.refresh_token) {
      cookieStore.set("tiktok_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: tokenData.refresh_expires_in || 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    // Store open_id for API calls
    if (tokenData.open_id) {
      cookieStore.set("tiktok_open_id", tokenData.open_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return NextResponse.redirect(new URL("/content?tiktok=connected", request.url));
  } catch (err) {
    console.error("TikTok OAuth error:", err);
    return NextResponse.redirect(
      new URL("/content?error=Failed to authenticate with TikTok", request.url)
    );
  }
}
