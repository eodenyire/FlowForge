import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildAuthorizationUrl, isProviderConfigured } from "@/lib/auth/oauth-config";
import type { OAuthProvider } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const validProviders = ["github", "google", "apple", "facebook", "twitter"];

  if (!validProviders.includes(provider)) {
    return NextResponse.json(
      { error: "Invalid OAuth provider" },
      { status: 400 }
    );
  }

  if (!isProviderConfigured(provider as OAuthProvider)) {
    return NextResponse.json(
      { error: `${provider} OAuth is not configured. Set ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET in environment variables.` },
      { status: 501 }
    );
  }

  const state = randomBytes(16).toString("hex");
  const authUrl = buildAuthorizationUrl(provider as OAuthProvider, state);

  // Store state in cookie for CSRF protection
  const response = NextResponse.redirect(authUrl);
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
