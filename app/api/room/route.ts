import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaDB";
import { auth } from "@clerk/nextjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "User Id is not passed" },
        { status: 401 }
      );
    }

    const room = await prisma.room.create({
      data: {
        ...body,
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.log(`Error while creating Room ${error}`);
    return NextResponse.json(
      { error: `Error while creating Room ${error}` },
      { status: 500 }
    );
  }
}
