import prisma from "@/lib/prismaDB";
import { auth } from "@clerk/nextjs";
import { unstable_noStore as noStore } from "next/cache";

export async function getBookingsByUserId() {
  noStore();
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error("Unauthorized!");
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId,
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
