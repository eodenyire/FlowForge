import { NextResponse } from "next/server";
import {
  getSessionByToken,
  createUser,
  toPublicUser,
} from "@/lib/store/auth-store";

async function getAuthUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;
  return getSessionByToken(token);
}

export async function POST(request: Request) {
  const auth = await getAuthUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (auth.user.role !== "admin") {
    return NextResponse.json(
      { error: "Only company admins can invite team members" },
      { status: 403 }
    );
  }

  if (!auth.user.companyId) {
    return NextResponse.json(
      { error: "You must be associated with a company to invite members" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { email, name, role } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    const validRoles = ["admin", "engineer", "viewer"];
    const assignedRole = validRoles.includes(role) ? role : "engineer";

    const user = await createUser({
      email,
      password: "changeme123", // Temporary password - user should change on first login
      name,
      companyId: auth.user.companyId,
      role: assignedRole,
    });

    return NextResponse.json(
      {
        user: toPublicUser(user),
        temporaryPassword: "changeme123",
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to invite member";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
