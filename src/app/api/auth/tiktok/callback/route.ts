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

    console.log("TikTok token exchange success:", {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      hasOpenId: !!tokenData.open_id,
      expiresIn: tokenData.expires_in,
      accessTokenLength: tokenData.access_token?.length,
      accessTokenPreview: tokenData.access_token?.slice(0, 50),
    });

    // Create redirect response and set cookies on it
    // Add debug info to URL temporarily
    const redirectUrl = new URL("/content", request.url);
    redirectUrl.searchParams.set("tiktok", "connected");
    redirectUrl.searchParams.set("has_access", tokenData.access_token ? "yes" : "no");
    redirectUrl.searchParams.set("access_len", String(tokenData.access_token?.length || 0));
    redirectUrl.searchParams.set("has_refresh", tokenData.refresh_token ? "yes" : "no");
    const response = NextResponse.redirect(redirectUrl);

    // Use most permissive cookie settings for debugging
    const cookieOptions = {
      httpOnly: false, // Allow JS access for debugging
      secure: false, // Allow HTTP
      sameSite: "lax" as const,
      maxAge: 86400 * 30, // 30 days
      path: "/",
    };

    // Store access token - base64 encode to avoid special character issues
    const accessToken = tokenData.access_token;
    console.log("Access token details:", {
      length: accessToken?.length,
      type: typeof accessToken,
      firstChars: accessToken?.slice(0, 30),
      hasSpecialChars: /[^a-zA-Z0-9._-]/.test(accessToken || ""),
    });

    // Also set a test cookie to verify cookie setting works
    response.cookies.set("tiktok_test", "cookie_works", cookieOptions);

    // Base64 encode the access token to avoid any special character issues
    if (accessToken && typeof accessToken === "string") {
      const base64Token = Buffer.from(accessToken).toString("base64");
      console.log("Base64 encoded token length:", base64Token.length);
      response.cookies.set("tiktok_access_token", base64Token, cookieOptions);
    }

    if (tokenData.refresh_token) {
      response.cookies.set("tiktok_refresh_token", tokenData.refresh_token, cookieOptions);
    }

    // Store open_id for API calls
    if (tokenData.open_id) {
      response.cookies.set("tiktok_open_id", tokenData.open_id, cookieOptions);
    }

    console.log("Cookies set on response, redirecting to:", redirectUrl.toString());
    return response;
  } catch (err) {
    console.error("TikTok OAuth error:", err);
    return NextResponse.redirect(
      new URL("/content?error=Failed to authenticate with TikTok", request.url)
    );
  }
}
