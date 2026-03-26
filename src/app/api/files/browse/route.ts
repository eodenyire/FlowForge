import { NextResponse } from "next/server";
import { listFiles, listDirs, readTextFile, readJsonFile } from "@/lib/data/file-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path") || "";
    const read = searchParams.get("read");

    if (read) {
      const content = await readJsonFile(path);
      if (content === null) {
        const text = await readTextFile(path);
        if (text === null) return NextResponse.json({ error: "File not found" }, { status: 404 });
        return NextResponse.json({ path, content: text, type: "text" });
      }
      return NextResponse.json({ path, content, type: "json" });
    }

    const dirs = await listDirs(path);
    const files = await listFiles(path);
    return NextResponse.json({ path, directories: dirs, files });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to browse files" },
      { status: 500 }
    );
  }
}
