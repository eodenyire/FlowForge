import { NextResponse } from "next/server";
import { getTableSchema, queryRows, insertRows } from "@/lib/data/database-manager";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; table: string }> }
) {
  try {
    const { id, table } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 100;
    const offset = Number(searchParams.get("offset")) || 0;

    const schema = await getTableSchema(id, table);
    if (!schema) return NextResponse.json({ error: "Table not found" }, { status: 404 });

    const rows = await queryRows(id, table, { limit, offset });
    return NextResponse.json({ schema, rows, count: rows.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to query table" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; table: string }> }
) {
  try {
    const { id, table } = await params;
    const body = await request.json();
    const rows = Array.isArray(body) ? body : body.rows || [body];
    const inserted = await insertRows(id, table, rows);
    return NextResponse.json({ inserted }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to insert rows" },
      { status: 500 }
    );
  }
}
