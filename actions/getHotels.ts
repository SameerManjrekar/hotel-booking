import prisma from "@/lib/prismaDB";

export const getHotels = async (searchParams: {
  title: string;
  country: string;
  state: string;
  city: string;
}) => {
  try {
    const { title, country, state, city } = searchParams;
    const hotels = await prisma.hotel.findMany({
      where: {
        title: {
          contains: title,
        },
        country,
        state,
        city,
      },
      include: { rooms: true },
    });

    if (!hotels) return null;

    return hotels;
  } catch (error) {
    console.log("Get Hotels error");
    throw new Error("Error in fetching all hotels");
  }
};
