import prisma from "@/lib/prismaDB";
import { unstable_noStore as noStore } from "next/cache";

export const getBookings = async (hotelId: string) => {
  noStore();
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const bookings = await prisma.booking.findMany({
      where: {
        hotelId: hotelId,
        endDate: {
          gt: yesterday,
        },
      },
    });

    if (!bookings) return null;

    return bookings;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};
