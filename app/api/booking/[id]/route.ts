import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaDB";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ messsage: "Unauthorized" }, { status: 401 });
    }

    if (!params.id) {
      return NextResponse.json(
        { messsage: "payment intent id is unavailable" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.update({
      where: {
        paymentIntentId: params.id,
      },
      data: { paymentStatus: true },
    });

    return NextResponse.json(booking, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: `Error at /api/booking/id Patch request ${error?.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ messsage: "Unauthorized" }, { status: 401 });
    }

    if (!params.id) {
      return NextResponse.json(
        { messsage: "Booking id is unavailable" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(booking, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: `Error at /api/booking/id delete request ${error?.message}` },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ messsage: "Unauthorized" }, { status: 401 });
    }

    if (!params.id) {
      return NextResponse.json(
        { messsage: "Hotel id is unavailable" },
        { status: 400 }
      );
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const bookings = await prisma.booking.findMany({
      where: {
        roomId: params.id,
        paymentStatus: true,
        endDate: {
          gt: yesterday,
        },
      },
    });

    if (!bookings) {
      return NextResponse.json(
        { message: "No Bookings for the HotelId" },
        { status: 400 }
      );
    }
    return NextResponse.json(bookings, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: `Error at /api/booking/id get request ${error?.message}` },
      { status: 500 }
    );
  }
}
