import { NextResponse } from "next/server";
import { listFlows, createFlow } from "@/lib/store";

export async function GET() {
  try {
    const flows = listFlows();
    return NextResponse.json(flows);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list flows" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Flow name is required" },
        { status: 400 }
      );
    }

    const flow = createFlow({
      name,
      description: description || "",
    });

    return NextResponse.json(flow, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create flow" },
      { status: 500 }
    );
  }
}
