import { NextResponse } from "next/server";
import { exchangeCodeForToken, fetchUserInfo, isProviderConfigured } from "@/lib/auth/oauth-config";
import { createOAuthUser, findUserByOAuth, createSession, getCompanyById, toPublicUser } from "@/lib/store/auth-store";
import type { OAuthProvider } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const validProviders = ["github", "google", "apple", "facebook", "twitter"];

  if (!validProviders.includes(provider)) {
    return NextResponse.redirect(new URL("/login?error=invalid_provider", request.url));
  }

  if (!isProviderConfigured(provider as OAuthProvider)) {
    return NextResponse.redirect(
      new URL(`/login?error=not_configured&provider=${provider}`, request.url)
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=oauth_denied&provider=${provider}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?error=no_code&provider=${provider}`, request.url)
    );
  }

  try {
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(
      provider as OAuthProvider,
      code
    );

    // Fetch user info from provider
    const userInfo = await fetchUserInfo(provider as OAuthProvider, accessToken);

    // Check if user already exists with this OAuth account
    let user = await findUserByOAuth(
      provider as OAuthProvider,
      userInfo.id
    );

    if (user) {
      // Existing user - create session
      const session = await createSession(user.id);
      const company = user.companyId
        ? await getCompanyById(user.companyId) ?? null
        : null;

      const redirectUrl = user.companyId
        ? `/auth/callback?token=${session.token}&userId=${user.id}`
        : `/auth/callback?token=${session.token}&userId=${user.id}&setup=true`;

      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // New user - create account
    const result = await createOAuthUser({
      provider: provider as OAuthProvider,
      providerAccountId: userInfo.id,
      providerEmail: userInfo.email,
      providerName: userInfo.name,
      providerAvatarUrl: userInfo.avatarUrl,
      accessToken,
    });

    const session = await createSession(result.user.id);
    const redirectUrl = result.user.companyId
      ? `/auth/callback?token=${session.token}&userId=${result.user.id}`
      : `/auth/callback?token=${session.token}&userId=${result.user.id}&setup=true`;

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL(`/login?error=oauth_failed&provider=${provider}`, request.url)
    );
  }
}
