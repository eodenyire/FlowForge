import { NextResponse } from "next/server";
import { getConnection, updateConnection, deleteConnection, listTables } from "@/lib/data/database-manager";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conn = await getConnection(id);
    if (!conn) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    const tables = await listTables(id);
    return NextResponse.json({ ...conn, tables });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get connection" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const conn = await updateConnection(id, body);
    if (!conn) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    return NextResponse.json(conn);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update connection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteConnection(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete connection" },
      { status: 500 }
    );
  }
}
