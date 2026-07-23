import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPlantSlug } from "@/lib/plants";

export async function GET(req: NextRequest) {
  const plant = req.nextUrl.searchParams.get("plant");
  const listKey = req.nextUrl.searchParams.get("listKey");
  if (!plant || !isPlantSlug(plant) || !listKey) {
    return NextResponse.json({ error: "Parámetros inválidos." }, { status: 400 });
  }
  const items = await prisma.masterListItem.findMany({
    where: { plantId: plant, listKey },
    orderBy: { label: "asc" },
  });
  return NextResponse.json({ options: items.map((i) => i.label) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { plant, listKey, label } = body as { plant?: string; listKey?: string; label?: string };

  if (!plant || !isPlantSlug(plant) || !listKey || !label || !label.trim()) {
    return NextResponse.json({ error: "Parámetros inválidos." }, { status: 400 });
  }

  const item = await prisma.masterListItem.upsert({
    where: { plantId_listKey_label: { plantId: plant, listKey, label: label.trim() } },
    update: {},
    create: { plantId: plant, listKey, label: label.trim() },
  });

  return NextResponse.json({ item });
}
