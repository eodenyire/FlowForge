import { NextResponse } from "next/server";
import { listTables, getTableSchema, queryRows, insertRows, createTable } from "@/lib/data/database-manager";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tables = await listTables(id);
    const result = [];
    for (const table of tables) {
      const schema = await getTableSchema(id, table);
      result.push(schema);
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list tables" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, columns } = body;
    if (!name) return NextResponse.json({ error: "Table name required" }, { status: 400 });
    const schema = await createTable(id, name, columns || []);
    return NextResponse.json(schema, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create table" },
      { status: 500 }
    );
  }
}
