import { getBookingsByHotelOwnerId } from "@/actions/getBookingsByHotelOwnerId";
import { getBookingsByUserId } from "@/actions/getBookingsByUserId";
import MyBookingForm from "@/components/booking/MyBookingForm";

const MyBookingsPage = async () => {
  const bookingIHaveMade = await getBookingsByUserId();
  const bookingsFromVisitors = await getBookingsByHotelOwnerId();
  
  if (!bookingIHaveMade && !bookingsFromVisitors) {
    return <div>No bookings found!</div>;
  }

  return (
    <div>
      {!!bookingIHaveMade?.length && (
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-6 mt-2">
            Here are the bookings you have made!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookingIHaveMade.map((booking) => (
              <MyBookingForm key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}
      {!!bookingsFromVisitors?.length && (
        <div>
          <h2 className="text-xl font-semibold md:text-2xl mb-6 mt-2">
            Here are the bookings visitors have made onn your hotel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookingsFromVisitors.map((booking) => (
              <MyBookingForm key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
