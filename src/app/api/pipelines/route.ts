import { NextResponse } from "next/server";
import { getSessionByToken } from "@/lib/store/auth-store";
import {
  createPipeline,
  getPipeline,
  listPipelines,
  listAllPipelines,
  updatePipeline,
  deletePipeline,
} from "@/lib/store/processor-group-store";

async function getAuthUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;
  return getSessionByToken(token);
}

export async function GET(request: Request) {
  const auth = await getAuthUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!auth.user.companyId) {
    return NextResponse.json(
      { error: "No company associated" },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const groupId = url.searchParams.get("groupId");

  if (id) {
    const pipeline = await getPipeline(id);
    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(pipeline);
  }

  if (groupId) {
    const pipelines = await listPipelines(groupId);
    return NextResponse.json({ pipelines });
  }

  const pipelines = await listAllPipelines(auth.user.companyId);
  return NextResponse.json({ pipelines });
}

export async function POST(request: Request) {
  const auth = await getAuthUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!auth.user.companyId) {
    return NextResponse.json(
      { error: "No company associated" },
      { status: 400 }
    );
  }

  if (auth.user.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers cannot create pipelines" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, description, groupId, tags } = body;

    if (!name || !groupId) {
      return NextResponse.json(
        { error: "Pipeline name and group ID are required" },
        { status: 400 }
      );
    }

    const pipeline = await createPipeline({
      name,
      description: description || "",
      groupId,
      companyId: auth.user.companyId,
      createdBy: auth.user.id,
      tags: tags || [],
    });

    return NextResponse.json(pipeline, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create pipeline";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const auth = await getAuthUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Pipeline ID is required" },
        { status: 400 }
      );
    }

    const pipeline = await updatePipeline(id, updates);
    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pipeline);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update pipeline";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const auth = await getAuthUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Pipeline ID is required" },
      { status: 400 }
    );
  }

  await deletePipeline(id);
  return NextResponse.json({ success: true });
}
