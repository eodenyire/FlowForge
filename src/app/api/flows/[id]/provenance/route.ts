import { NextResponse } from "next/server";
import { getProvenanceForFlow, getExecutionsForFlow } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const events = getProvenanceForFlow(id);
    const executions = getExecutionsForFlow(id);
    return NextResponse.json({ events, executions });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get provenance",
      },
      { status: 500 }
    );
  }
}
