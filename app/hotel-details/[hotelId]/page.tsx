import { getBookings } from "@/actions/getBookings";
import { getHotelById } from "@/actions/getHotelById";
import HotelDetailsComponent from "@/components/hotel/HotelDetailsComponent";
import { Booking } from "@prisma/client";

type HotelDetailsPageProps = {
  params: {
    hotelId: string;
  };
};

const HotelDetailsPage = async ({
  params: { hotelId },
}: HotelDetailsPageProps) => {
  const hotel = await getHotelById(hotelId);
  if (!hotel) return <div>Oops!, hotel with given Id not found.</div>;
  const bookings = await getBookings(hotelId) as Booking[];
  return (
    <div>
      <HotelDetailsComponent hotel={hotel} bookings={bookings}/>
    </div>
  );
};

export default HotelDetailsPage;
