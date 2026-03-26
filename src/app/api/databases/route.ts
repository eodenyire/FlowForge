import { NextResponse } from "next/server";
import { createConnection, listConnections } from "@/lib/data/database-manager";

export async function GET() {
  try {
    const connections = await listConnections();
    return NextResponse.json(connections);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list connections" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, host, port, database, username, password, ssl, metadata } = body;
    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }
    const conn = await createConnection({
      name, type, host: host || "", port: port || 0,
      database: database || "", username: username || "", password: password || "",
      ssl: ssl || false, metadata: metadata || {},
    });
    return NextResponse.json(conn, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create connection" },
      { status: 500 }
    );
  }
}
