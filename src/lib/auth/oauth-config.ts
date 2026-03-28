import type { OAuthProvider, OAuthProviderConfig, OAuthUserInfo } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const OAUTH_PROVIDERS: Record<OAuthProvider, OAuthProviderConfig> = {
  github: {
    provider: "github",
    name: "GitHub",
    icon: "github",
    color: "text-white",
    bgColor: "bg-neutral-800 hover:bg-neutral-700",
    borderColor: "border-neutral-700",
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scopes: ["read:user", "user:email"],
    redirectUri: `${BASE_URL}/api/auth/oauth/github/callback`,
  },
  google: {
    provider: "google",
    name: "Google",
    icon: "google",
    color: "text-white",
    bgColor: "bg-white hover:bg-neutral-100",
    borderColor: "border-neutral-300",
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scopes: ["openid", "email", "profile"],
    redirectUri: `${BASE_URL}/api/auth/oauth/google/callback`,
  },
  apple: {
    provider: "apple",
    name: "Apple",
    icon: "apple",
    color: "text-white",
    bgColor: "bg-black hover:bg-neutral-900",
    borderColor: "border-neutral-700",
    clientId: process.env.APPLE_CLIENT_ID || "",
    clientSecret: process.env.APPLE_CLIENT_SECRET || "",
    authorizeUrl: "https://appleid.apple.com/authorize",
    tokenUrl: "https://appleid.apple.com/auth/token",
    userInfoUrl: "",
    scopes: ["name", "email"],
    redirectUri: `${BASE_URL}/api/auth/oauth/apple/callback`,
  },
  facebook: {
    provider: "facebook",
    name: "Facebook",
    icon: "facebook",
    color: "text-white",
    bgColor: "bg-[#1877F2] hover:bg-[#166FE5]",
    borderColor: "border-[#1877F2]",
    clientId: process.env.FACEBOOK_CLIENT_ID || "",
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    authorizeUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    userInfoUrl: "https://graph.facebook.com/me?fields=id,name,email,picture",
    scopes: ["email", "public_profile"],
    redirectUri: `${BASE_URL}/api/auth/oauth/facebook/callback`,
  },
  twitter: {
    provider: "twitter",
    name: "Twitter",
    icon: "twitter",
    color: "text-white",
    bgColor: "bg-[#1DA1F2] hover:bg-[#1A91DA]",
    borderColor: "border-[#1DA1F2]",
    clientId: process.env.TWITTER_CLIENT_ID || "",
    clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
    authorizeUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    userInfoUrl: "https://api.twitter.com/2/users/me",
    scopes: ["tweet.read", "users.read"],
    redirectUri: `${BASE_URL}/api/auth/oauth/twitter/callback`,
  },
};

export function getProviderConfig(provider: OAuthProvider): OAuthProviderConfig {
  return OAUTH_PROVIDERS[provider];
}

export function isProviderConfigured(provider: OAuthProvider): boolean {
  const config = OAUTH_PROVIDERS[provider];
  return !!config.clientId && !!config.clientSecret;
}

export function getConfiguredProviders(): OAuthProviderConfig[] {
  return Object.values(OAUTH_PROVIDERS).filter(
    (p) => p.clientId && p.clientSecret
  );
}

export function buildAuthorizationUrl(
  provider: OAuthProvider,
  state: string
): string {
  const config = OAUTH_PROVIDERS[provider];
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
  });

  if (provider === "google") {
    params.set("access_type", "offline");
    params.set("prompt", "consent");
  }

  if (provider === "twitter") {
    params.set("code_challenge", "challenge");
    params.set("code_challenge_method", "plain");
  }

  return `${config.authorizeUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  provider: OAuthProvider,
  code: string
): Promise<string> {
  const config = OAUTH_PROVIDERS[provider];

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
  });

  if (provider === "twitter") {
    body.set("code_verifier", "challenge");
  }

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  const data = await response.json();
  return data.access_token;
}

export async function fetchUserInfo(
  provider: OAuthProvider,
  accessToken: string
): Promise<OAuthUserInfo> {
  const config = OAUTH_PROVIDERS[provider];

  if (provider === "apple") {
    return {
      id: "apple_" + Date.now(),
      email: "",
      name: "Apple User",
      avatarUrl: "",
    };
  }

  const response = await fetch(config.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const data = await response.json();
  return normalizeUserInfo(provider, data);
}

function normalizeUserInfo(
  provider: OAuthProvider,
  raw: Record<string, unknown>
): OAuthUserInfo {
  switch (provider) {
    case "github":
      return {
        id: String(raw.id),
        email: (raw.email as string) || "",
        name: (raw.name as string) || (raw.login as string) || "",
        avatarUrl: (raw.avatar_url as string) || "",
      };
    case "google":
      return {
        id: String(raw.id),
        email: (raw.email as string) || "",
        name: (raw.name as string) || "",
        avatarUrl: (raw.picture as string) || "",
      };
    case "facebook":
      return {
        id: String(raw.id),
        email: (raw.email as string) || "",
        name: (raw.name as string) || "",
        avatarUrl:
          ((raw.picture as Record<string, unknown>)?.data as Record<string, unknown>)?.url as string || "",
      };
    case "twitter":
      return {
        id: String((raw.data as Record<string, unknown>)?.id || raw.id),
        email: ((raw.data as Record<string, unknown>)?.email as string) || "",
        name:
          ((raw.data as Record<string, unknown>)?.name as string) ||
          ((raw.data as Record<string, unknown>)?.username as string) ||
          "",
        avatarUrl:
          ((raw.data as Record<string, unknown>)?.profile_image_url as string) || "",
      };
    default:
      return {
        id: String(raw.id),
        email: (raw.email as string) || "",
        name: (raw.name as string) || "",
        avatarUrl: "",
      };
  }
}
