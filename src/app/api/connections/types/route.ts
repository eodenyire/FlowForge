import { NextResponse } from "next/server";
import { getSessionByToken } from "@/lib/store/auth-store";
import {
  getAllConnectionTypeDefinitions,
  getConnectionTypeDefinition,
} from "@/lib/store/connections-store";

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

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (type) {
    const def = getConnectionTypeDefinition(type as Parameters<typeof getConnectionTypeDefinition>[0]);
    if (!def) {
      return NextResponse.json(
        { error: "Connection type not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ definition: def });
  }

  const definitions = getAllConnectionTypeDefinitions();
  return NextResponse.json({ definitions });
}
