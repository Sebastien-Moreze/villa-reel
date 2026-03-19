import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/http-error";

export async function GET() {
  const start = Date.now();

  let dbStatus: "connected" | "disconnected" | "unknown" = "unknown";

  try {
    // Simple ping DB
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch {
    dbStatus = "disconnected";
  }

  const uptimeSeconds = Math.round(process.uptime());
  const version = process.env.APP_VERSION ?? process.env.npm_package_version ?? "unknown";

  const payload = {
    status: dbStatus === "connected" ? "ok" : "degraded",
    db: dbStatus,
    version,
    uptime: uptimeSeconds,
    responseTimeMs: Date.now() - start,
  };

  if (dbStatus !== "connected") {
    return apiError.unavailable();
  }

  return NextResponse.json(payload, { status: 200 });
}

