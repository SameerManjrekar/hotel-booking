import prisma from "@/lib/prismaDB";
import { auth } from "@clerk/nextjs";

export async function getBookingsByHotelOwnerId() {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error("Unauthorized!");
    }

    const bookings = await prisma.booking.findMany({
      where: {
        hotelOwnerId: userId,
      },
      include: {
        Room: true,
        Hotel: true,
      },
      orderBy: {
        bookedAt: "desc",
      },
    });

    if (!bookings) return null;

    return bookings;
  } catch (err: any) {
    console.error(err);
    throw new Error(err);
  }
}
