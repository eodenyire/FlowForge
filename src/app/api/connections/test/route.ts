import { NextResponse } from "next/server";
import { getSessionByToken } from "@/lib/store/auth-store";
import { testConnection } from "@/lib/store/connections-store";

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
    const { connectionId } = body;

    if (!connectionId) {
      return NextResponse.json(
        { error: "Connection ID is required" },
        { status: 400 }
      );
    }

    const result = await testConnection(connectionId);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Connection test failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
