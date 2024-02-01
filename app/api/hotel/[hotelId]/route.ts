import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prismaDB";
import { auth } from "@clerk/nextjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { hotelId: string } }
) {
  try {
    const body = await req.json();

    const { userId } = auth();

    if (!params.hotelId) {
      return NextResponse.json(
        { message: "Hotel Id is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: params.hotelId },
    });

    if (!hotel) {
      return NextResponse.json(
        { message: "Hotel Not found for given Id" },
        { status: 404 }
      );
    }

    if (hotel.userId !== userId) {
      return NextResponse.json(
        { error: "This User cannot update the Hotel" },
        { status: 400 }
      );
    }

    const data = await prisma.hotel.update({
      where: { id: params.hotelId },
      data: { ...body },
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: `Error in Updating Hotel API ${error?.message}` },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { hotelId: string } }
) {
  try {
    const { userId } = auth();

    if (!params.hotelId) {
      return NextResponse.json(
        { message: "Hotel Not found for given Id" },
        { status: 404 }
      );
    }

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: params.hotelId },
    });

    if (!hotel) {
      return NextResponse.json(
        { message: "Hotel Not found for given Id" },
        { status: 404 }
      );
    }

    if (hotel.userId !== userId) {
      return NextResponse.json(
        { error: "This User cannot delete the Hotel" },
        { status: 400 }
      );
    }

    await prisma.hotel.delete({ where: { id: params.hotelId } });

    return NextResponse.json(
      { message: "Hotel Deleted Successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: `Error in Deleting Hotel API ${error?.message}` },
      { status: 400 }
    );
  }
}
