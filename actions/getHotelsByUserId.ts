import prisma from "@/lib/prismaDB";
import { auth } from "@clerk/nextjs";
import { unstable_noStore as noStore } from "next/cache";

export async function getHotelsByUserId() {
  noStore();
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const hotelsByUserId = await prisma.hotel.findMany({
      where: {
        userId: userId,
      },
      include: {
        rooms: true,
      },
    });

    if (!hotelsByUserId) return null;

    return hotelsByUserId;
  } catch (err: any) {
    console.error(err);
    throw new Error(err);
  }
}
