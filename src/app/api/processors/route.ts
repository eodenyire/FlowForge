import { NextResponse } from "next/server";
import { getAllProcessorDefinitions } from "@/lib/processors";

export async function GET() {
  try {
    const definitions = getAllProcessorDefinitions();
    return NextResponse.json(definitions);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to list processor definitions",
      },
      { status: 500 }
    );
  }
}
