import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prismaDB";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const hotel = await prisma.hotel.create({
      data: {
        ...body,
        userId,
      },
    });

    return NextResponse.json(hotel, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: `Error at /api/hotel POST request ${error?.message}` },
      { status: 500 }
    );
  }
}
