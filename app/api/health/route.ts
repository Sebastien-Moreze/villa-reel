import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const start = Date.now();

  let dbStatus: "connected" | "disconnected" | "unknown" = "unknown";

  try {
    // Simple ping DB
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _result = await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (error) {
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
    return NextResponse.json(payload, { status: 503 });
  }

  return NextResponse.json(payload, { status: 200 });
}

