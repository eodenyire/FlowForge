import { NextResponse } from "next/server";
import { getSessionByToken } from "@/lib/store/auth-store";
import {
  createConnection,
  getConnection,
  listConnections,
  updateConnection,
  deleteConnection,
} from "@/lib/store/connections-store";

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
    return NextResponse.json(
      { error: "No company associated" },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const category = url.searchParams.get("category") as
    | "database"
    | "file-server"
    | "object-storage"
    | "api"
    | "email"
    | null;

  if (id) {
    const conn = await getConnection(id);
    if (!conn) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ connection: conn });
  }

  const connections = await listConnections(
    auth.user.companyId,
    category ?? undefined
  );
  return NextResponse.json({ connections });
}

export async function POST(request: Request) {
  const auth = await getAuthUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!auth.user.companyId) {
    return NextResponse.json(
      { error: "No company associated" },
      { status: 400 }
    );
  }

  if (auth.user.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers cannot create connections" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, description, type, config, tags } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Connection name and type are required" },
        { status: 400 }
      );
    }

    const conn = await createConnection({
      name,
      description: description || "",
      type,
      companyId: auth.user.companyId,
      createdBy: auth.user.id,
      config: config || {},
      tags: tags || [],
    });

    return NextResponse.json({ connection: conn }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create connection";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const auth = await getAuthUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Connection ID is required" },
        { status: 400 }
      );
    }

    const conn = await updateConnection(id, updates);
    if (!conn) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ connection: conn });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update connection";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const auth = await getAuthUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Connection ID is required" },
      { status: 400 }
    );
  }

  await deleteConnection(id);
  return NextResponse.json({ success: true });
}
