import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/instagram/callback`;

  if (!clientId) {
    return NextResponse.json(
      { error: "Instagram App ID not configured" },
      { status: 500 }
    );
  }

  // Instagram OAuth URL
  const authUrl = new URL("https://api.instagram.com/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "user_profile,user_media");
  authUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(authUrl.toString());
}
