import { getHotelsByUserId } from "@/actions/getHotelsByUserId";
import { HotelWithRooms } from "@/components/hotel/AddHotelForm";
import HotelList from "@/components/hotel/HotelList";

const MyHotelsPge = async () => {
  const hotelsByUserId = await getHotelsByUserId();

  if (!hotelsByUserId) return <div>No Hotels found for the user!</div>;
  return (
    <div>
      <h2 className="text02xl font-semibold">My Hotels</h2>
      <HotelList hotels={hotelsByUserId as HotelWithRooms[]} />
    </div>
  );
};

export default MyHotelsPge;
