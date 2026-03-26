import { NextResponse } from "next/server";
import { generateAllSampleFiles } from "@/lib/data/sample-files";

export async function POST() {
  try {
    const files = await generateAllSampleFiles();
    return NextResponse.json({ message: "Sample files generated", files });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate samples" },
      { status: 500 }
    );
  }
}
