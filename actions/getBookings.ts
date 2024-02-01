import prisma from "@/lib/prismaDB";

export const getBookings = async (hotelId: string) => {
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
