import { NextResponse } from "next/server";
import { getConfiguredProviders } from "@/lib/auth/oauth-config";

export async function GET() {
  const providers = getConfiguredProviders().map((p) => ({
    provider: p.provider,
    name: p.name,
    icon: p.icon,
    color: p.color,
    bgColor: p.bgColor,
    borderColor: p.borderColor,
  }));

  return NextResponse.json({ providers });
}
