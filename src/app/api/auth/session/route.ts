import { NextResponse } from "next/server";
import { getSessionByToken, toPublicUser } from "@/lib/store/auth-store";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const result = await getSessionByToken(token);
    if (!result) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    return NextResponse.json({
      user: toPublicUser(result.user),
      company: result.company,
    });
  } catch {
    return NextResponse.json({ error: "Session check failed" }, { status: 500 });
  }
}
