import { NextResponse } from "next/server";
import { createUser, createSession, createCompany, toPublicUser } from "@/lib/store/auth-store";
import type { SignupRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body: SignupRequest = await request.json();
    const { email, password, name, companyName } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const user = await createUser({
      email,
      password,
      name,
      role: "admin",
    });

    let company = null;
    if (companyName) {
      company = await createCompany({
        name: companyName,
        description: "",
        industry: "",
        size: "",
        website: "",
        ownerId: user.id,
      });

      // Update user with company association
      const { updateUser } = await import("@/lib/store/auth-store");
      await updateUser(user.id, { companyId: company.id });
      user.companyId = company.id;
    }

    const session = await createSession(user.id);

    return NextResponse.json(
      {
        user: toPublicUser(user),
        company,
        token: session.token,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
