import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("x_oauth_state")?.value;
  const codeVerifier = cookieStore.get("x_code_verifier")?.value;

  // Clean up OAuth cookies
  cookieStore.delete("x_oauth_state");
  cookieStore.delete("x_code_verifier");

  if (error) {
    return NextResponse.redirect(
      new URL(`/content?error=${encodeURIComponent(error)}`, request.url)
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

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  const redirectUri = "http://localhost:3000/api/auth/x/callback";

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("X token error:", tokenData);
      return NextResponse.redirect(
        new URL(
          `/content?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`,
          request.url
        )
      );
    }

    // Store tokens in cookies
    cookieStore.set("x_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokenData.expires_in || 7200,
      path: "/",
    });

    if (tokenData.refresh_token) {
      cookieStore.set("x_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return NextResponse.redirect(new URL("/content?x=connected", request.url));
  } catch (err) {
    console.error("X OAuth error:", err);
    return NextResponse.redirect(
      new URL("/content?error=Failed to authenticate with X", request.url)
    );
  }
}
