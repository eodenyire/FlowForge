import { NextResponse } from "next/server";
import {
  getSessionByToken,
  updateUser,
  toPublicUser,
  getUserById,
} from "@/lib/store/auth-store";

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

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") || auth.user.id;

  // Users can only view their own profile unless admin
  if (userId !== auth.user.id && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ profile: toPublicUser(user) });
}

export async function PUT(request: Request) {
  const auth = await getAuthUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      title,
      department,
      specializations,
      bio,
      phone,
      location,
      yearsExperience,
      preferredLanguages,
    } = body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (title !== undefined) updates.title = title;
    if (department !== undefined) updates.department = department;
    if (specializations !== undefined) updates.specializations = specializations;
    if (bio !== undefined) updates.bio = bio;
    if (phone !== undefined) updates.phone = phone;
    if (location !== undefined) updates.location = location;
    if (yearsExperience !== undefined) updates.yearsExperience = yearsExperience;
    if (preferredLanguages !== undefined)
      updates.preferredLanguages = preferredLanguages;

    const user = await updateUser(auth.user.id, updates as Partial<typeof auth.user>);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: toPublicUser(user) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
