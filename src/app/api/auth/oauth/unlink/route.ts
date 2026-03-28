import { NextResponse } from "next/server";
import { getSessionByToken, unlinkOAuthAccount, getOAuthAccountsForUser } from "@/lib/store/auth-store";
import type { OAuthProvider } from "@/lib/types";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = await getSessionByToken(token);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { provider, providerAccountId } = body;

    if (!provider || !providerAccountId) {
      return NextResponse.json(
        { error: "Provider and providerAccountId are required" },
        { status: 400 }
      );
    }

    // Verify the account belongs to the user
    const accounts = await getOAuthAccountsForUser(auth.user.id);
    const account = accounts.find(
      (a) => a.provider === provider && a.providerAccountId === providerAccountId
    );

    if (!account) {
      return NextResponse.json(
        { error: "OAuth account not found for this user" },
        { status: 404 }
      );
    }

    // Check if user has a password or other OAuth accounts
    const hasPassword = !!auth.user.passwordHash;
    const otherAccounts = accounts.filter(
      (a) => a.provider !== provider || a.providerAccountId !== providerAccountId
    );

    if (!hasPassword && otherAccounts.length === 0) {
      return NextResponse.json(
        {
          error:
            "Cannot unlink the only sign-in method. Set a password first or link another account.",
        },
        { status: 400 }
      );
    }

    await unlinkOAuthAccount(provider as OAuthProvider, providerAccountId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to unlink account";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
