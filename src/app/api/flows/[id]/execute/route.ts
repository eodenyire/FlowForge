import { NextResponse } from "next/server";
import { getFlow } from "@/lib/store";
import { executeFlow } from "@/lib/engine";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const flow = await getFlow(id);
    if (!flow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    if (flow.processors.length === 0) {
      return NextResponse.json(
        { error: "Flow has no processors to execute" },
        { status: 400 }
      );
    }

    const execution = await executeFlow(flow);
    return NextResponse.json(execution, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to execute flow",
      },
      { status: 500 }
    );
  }
}
