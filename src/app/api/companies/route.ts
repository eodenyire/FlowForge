import { NextResponse } from "next/server";
import {
  getSessionByToken,
  createCompany,
  updateCompany,
  getCompanyById,
  updateUser,
  toPublicUser,
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
  const id = url.searchParams.get("id");

  if (id) {
    const company = await getCompanyById(id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    return NextResponse.json({ company });
  }

  if (auth.user.companyId) {
    const company = await getCompanyById(auth.user.companyId);
    return NextResponse.json({ company: company ?? null });
  }

  return NextResponse.json({ company: null });
}

export async function POST(request: Request) {
  const auth = await getAuthUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, industry, size, website } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const company = await createCompany({
      name,
      description: description || "",
      industry: industry || "",
      size: size || "",
      website: website || "",
      ownerId: auth.user.id,
    });

    // Associate user with company
    await updateUser(auth.user.id, { companyId: company.id });

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create company";
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
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    const company = await updateCompany(id, updates);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update company";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
