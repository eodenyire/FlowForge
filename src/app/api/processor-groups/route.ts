import { NextResponse } from "next/server";
import { getSessionByToken } from "@/lib/store/auth-store";
import {
  createGroup,
  getGroup,
  listGroups,
  updateGroup,
  deleteGroup,
  getGroupsByParent,
  getGroupBreadcrumb,
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
  const parentGroupId = url.searchParams.get("parentGroupId");
  const breadcrumbs = url.searchParams.get("breadcrumbs");

  if (id) {
    const group = await getGroup(id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    const crumbs = await getGroupBreadcrumb(group.parentGroupId);
    return NextResponse.json({ group, breadcrumbs: crumbs });
  }

  if (breadcrumbs) {
    const crumbs = await getGroupBreadcrumb(breadcrumbs || null);
    return NextResponse.json({ breadcrumbs: crumbs });
  }

  const groups = parentGroupId
    ? await getGroupsByParent(auth.user.companyId, parentGroupId)
    : await listGroups(auth.user.companyId);

  return NextResponse.json({ groups });
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
      { error: "Viewers cannot create processor groups" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, description, parentGroupId, tags } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    const group = await createGroup({
      name,
      description: description || "",
      companyId: auth.user.companyId,
      parentGroupId: parentGroupId || null,
      createdBy: auth.user.id,
      tags: tags || [],
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create group";
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
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    const group = await updateGroup(id, updates);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json({ group });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update group";
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
      { error: "Group ID is required" },
      { status: 400 }
    );
  }

  await deleteGroup(id);
  return NextResponse.json({ success: true });
}
