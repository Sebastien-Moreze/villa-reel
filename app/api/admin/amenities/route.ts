import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { z } from "zod";

const amenitySchema = z.object({
  key: z.string().min(1).max(100),
  labelFr: z.string().min(1).max(200),
  labelEn: z.string().min(1).max(200),
  icon: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
});

// GET — list all amenities
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const amenities = await prisma.amenity.findMany({
    orderBy: [{ category: "asc" }, { labelFr: "asc" }],
    include: { villas: true },
  });

  return NextResponse.json(amenities);
}

// POST — create a new amenity
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = amenitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.amenity.findUnique({
    where: { key: parsed.data.key },
  });

  if (existing) {
    return NextResponse.json(
      { error: "An amenity with this key already exists" },
      { status: 409 },
    );
  }

  const amenity = await prisma.amenity.create({ data: parsed.data });

  // Auto-link to villa id=1
  await prisma.villaAmenity.create({
    data: { villaId: 1, amenityId: amenity.id },
  });

  return NextResponse.json(amenity, { status: 201 });
}

// PUT — update an amenity
export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...data } = body;

  if (!id || typeof id !== "number") {
    return NextResponse.json({ error: "Missing amenity id" }, { status: 400 });
  }

  const parsed = amenitySchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const amenity = await prisma.amenity.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(amenity);
}

// DELETE — delete an amenity
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.amenity.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
