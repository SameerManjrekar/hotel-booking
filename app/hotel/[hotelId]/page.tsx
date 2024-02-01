import { getHotelById } from "@/actions/getHotelById";
import AddHotelForm from "@/components/hotel/AddHotelForm";
import { auth } from "@clerk/nextjs";

interface HotelProps {
  params: {
    hotelId: string;
  };
}

const Hotel = async ({ params: { hotelId } }: HotelProps) => {
  const hotel = await getHotelById(hotelId);
  const { userId } = auth();

  if (!userId) return <div>Not authenticated...</div>;

  if (hotel && hotel.userId !== userId) return <div>Access denied...</div>;

  return (
    <div>
      <AddHotelForm hotel={hotel} />
    </div>
  );
};

export default Hotel;
