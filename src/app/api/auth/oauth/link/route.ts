import { NextResponse } from "next/server";
import { getSessionByToken, getOAuthAccountsForUser } from "@/lib/store/auth-store";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = await getSessionByToken(token);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await getOAuthAccountsForUser(auth.user.id);
  return NextResponse.json({
    accounts: accounts.map((a) => ({
      id: a.id,
      provider: a.provider,
      providerAccountId: a.providerAccountId,
      providerEmail: a.providerEmail,
      providerName: a.providerName,
      providerAvatarUrl: a.providerAvatarUrl,
      createdAt: a.createdAt,
    })),
  });
}
