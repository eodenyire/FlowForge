import { NextResponse } from "next/server";
import { authenticateUser, createSession, getCompanyById, toPublicUser } from "@/lib/store/auth-store";
import type { LoginRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const company = user.companyId
      ? await getCompanyById(user.companyId) ?? null
      : null;
    const session = await createSession(user.id);

    return NextResponse.json({
      user: toPublicUser(user),
      company,
      token: session.token,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
