import { NextResponse } from "next/server";
import { getFlow, updateFlow, deleteFlow } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const flow = getFlow(id);
    if (!flow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }
    return NextResponse.json(flow);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get flow" },
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
    const flow = updateFlow(id, body);
    if (!flow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }
    return NextResponse.json(flow);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update flow" },
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
    const deleted = deleteFlow(id);
    if (!deleted) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete flow" },
      { status: 500 }
    );
  }
}
