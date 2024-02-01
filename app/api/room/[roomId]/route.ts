import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaDB";
import { auth } from "@clerk/nextjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const body = await req.json();

    const { userId } = auth();

    if (!params.roomId) {
      return NextResponse.json(
        { message: "Room Id is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const room = await prisma.room.update({
      where: {
        id: params.roomId,
      },
      data: { ...body },
    });

    return NextResponse.json(room, { status: 200 });
  } catch (error) {
    console.log(`Error while updating Room ${error}`);
    return NextResponse.json(
      { error: `Error while updating Room ${error}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { userId } = auth();

    if (!params.roomId) {
      return NextResponse.json(
        { message: "Room Not found for given Id" },
        { status: 404 }
      );
    }

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const room = await prisma.room.findUnique({
      where: { id: params.roomId },
    });

    if (!room) {
      return NextResponse.json(
        { message: "Room Not found for given Id" },
        { status: 404 }
      );
    }

    await prisma.room.delete({ where: { id: params.roomId } });

    return NextResponse.json(
      { message: "Room Deleted Successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.log(`Error while deleting Room ${error}`);
    return NextResponse.json(
      { error: `Error while deleting Room ${error}` },
      { status: 500 }
    );
  }
}
