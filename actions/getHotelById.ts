import prisma from "@/lib/prismaDB";
import { unstable_noStore as noStore } from "next/cache";

export const getHotelById = async (hotelId: string) => {
  noStore();
  try {
    const hotel = await prisma.hotel.findUnique({
      where: {
        id: hotelId,
      },
      include: {
        rooms: true,
      },
    });

    if (!hotel) return null;

    return hotel;
  } catch (error: any) {
    throw new Error(error);
  }
};
