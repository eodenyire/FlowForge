import { NextResponse } from "next/server";
import {
  getSessionByToken,
  getUsersByCompany,
} from "@/lib/store/auth-store";

async function getAuthUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;
  return getSessionByToken(token);
}

export async function GET(request: Request) {
  const auth = await getAuthUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!auth.user.companyId) {
    return NextResponse.json({ members: [] });
  }

  const members = await getUsersByCompany(auth.user.companyId);
  return NextResponse.json({ members });
}
