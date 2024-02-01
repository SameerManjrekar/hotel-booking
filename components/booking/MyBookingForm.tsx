"use client";

import { Booking, Hotel, Room } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Image from "next/image";
import AmenityItem from "../AmenityItem";
import {
  AirVent,
  Bath,
  Bed,
  BedDouble,
  BedIcon,
  Castle,
  Home,
  MapPin,
  MountainSnow,
  Ship,
  Trees,
  Tv,
  Users,
  UtensilsCrossed,
  VolumeX,
  Wifi,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "../ui/use-toast";
import { differenceInCalendarDays, format } from "date-fns";
import { useAuth } from "@clerk/nextjs";
import useBookRoom from "@/hooks/useBookRoom";
import useLocation from "@/hooks/useLocation";
import { Button } from "../ui/button";

interface MyBookingFormProps {
  booking: Booking & { Room: Room | null } & { Hotel: Hotel | null };
}

const MyBookingForm = ({ booking }: MyBookingFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { setRoomData, paymentIntentId, setClientSecret, setPaymentIntentId } =
    useBookRoom();

  const [bookingIsLoading, setBookingIsLoading] = useState(false);
  const { userId } = useAuth();

  const { getCountryByCode, getStateByCode } = useLocation();

  const { Room, Hotel } = booking;

  if (!Hotel || !Room) return <div>Missing Room and Hotel data</div>;

  const country = getCountryByCode(Hotel.country);
  const state = getStateByCode(Hotel.country, Hotel.state);
  const dayCount = differenceInCalendarDays(booking.endDate, booking.startDate);

  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);

  const handleBookRoom = async () => {
    try {
      if (!userId)
        return toast({
          variant: "destructive",
          description: "Oops! Make sure you are logged in!",
        });

      if (!Hotel?.userId)
        return toast({
          variant: "destructive",
          description: "Something went wrong. Please try again!",
        });

      setBookingIsLoading(true);

      const bookingRoomData = {
        room: Room,
        totalPrice: booking.totalPrice,
        breakfastIncluded: booking.breakfastIncluded,
        startDate: booking.startDate,
        endDate: booking.endDate,
      };

      // call function from zustand
      setRoomData(bookingRoomData);

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking: {
            hotelOwnerId: Hotel.userId,
            hotelId: Hotel.id,
            roomId: Room?.id,
            startDate: bookingRoomData.startDate,
            endDate: bookingRoomData.endDate,
            breakfastIncluded: bookingRoomData.breakfastIncluded,
            totalPrice: bookingRoomData.totalPrice,
            currency: "usd",
          },
          payment_intent_id: paymentIntentId,
        }),
      });

      // console.log("response", { response, bookingRoomData });
      const data = await response.json();

      // console.log("data", data);

      if (response.status === 401) {
        return router.push("/login");
      }

      if (response.ok) {
        setBookingIsLoading(false);
        setClientSecret(data.paymentIntent.client_secret);
        setPaymentIntentId(data.paymentIntent.id);
        router.push("/book-room");
      }
    } catch (error: any) {
      setBookingIsLoading(false);
      console.log(error);
      toast({
        variant: "destructive",
        description: `ERROR in Stripe Payment Intent ${error.message}`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{Hotel.title}</CardTitle>
        <CardDescription>
          <div className="font-semibold mt-1">
            <AmenityItem>
              {country?.name && state?.name && Hotel.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  {country?.name}, {state?.name}, {Hotel.city}
                </div>
              )}
            </AmenityItem>
            <p className="mt-2">{Hotel.locationDescription}</p>
          </div>
        </CardDescription>
        <CardTitle>{Room?.title}</CardTitle>
        <CardDescription>{Room?.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="aspect-square overflow-hidden relative h-[200px] rounded-lg">
          <Image
            fill
            src={Room?.image as string}
            alt={Room?.title as string}
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 content-start text-sm">
          <AmenityItem>
            <BedIcon className="h-4 w-4" />
            {Room?.bedCount} Bed{"(s)"}
          </AmenityItem>
          <AmenityItem>
            <Users className="h-4 w-4" />
            {Room?.guestCount} Guest{"(s)"}
          </AmenityItem>
          <AmenityItem>
            <Bath className="h-4 w-4" />
            {Room?.bathroomCount} bathrooms{"(s)"}
          </AmenityItem>
          {!!Room?.kingBed && (
            <AmenityItem>
              <BedDouble className="h-4 w-4" />
              {Room.kingBed} King Bed{"(s)"}
            </AmenityItem>
          )}
          {!!Room?.queenBed && (
            <AmenityItem>
              <Bed className="h-4 w-4" />
              {Room.queenBed} Queen Bed{"(s)"}
            </AmenityItem>
          )}
          {Room?.roomService && (
            <AmenityItem>
              <UtensilsCrossed className="h-4 w-4" />
              {Room.queenBed} Room Services
            </AmenityItem>
          )}
          {Room?.TV && (
            <AmenityItem>
              <Tv className="h-4 w-4" />
              TV
            </AmenityItem>
          )}
          {Room?.balcony && (
            <AmenityItem>
              <Home className="h-4 w-4" />
              Balcony
            </AmenityItem>
          )}
          {Room?.freeWifi && (
            <AmenityItem>
              <Wifi className="h-4 w-4" />
              Free Wifi
            </AmenityItem>
          )}
          {Room?.cityView && (
            <AmenityItem>
              <Castle className="h-4 w-4" />
              City View
            </AmenityItem>
          )}
          {Room?.oceanView && (
            <AmenityItem>
              <Ship className="h-4 w-4" />
              Ocean View
            </AmenityItem>
          )}
          {Room?.forestView && (
            <AmenityItem>
              <Trees className="h-4 w-4" />
              Forest View
            </AmenityItem>
          )}
          {Room?.mountainView && (
            <AmenityItem>
              <MountainSnow className="h-4 w-4" />
              Mountain View
            </AmenityItem>
          )}
          {Room?.airContioner && (
            <AmenityItem>
              <AirVent className="h-4 w-4" />
              Air Conditioner
            </AmenityItem>
          )}
          {Room?.soundProof && (
            <AmenityItem>
              <VolumeX className="h-4 w-4" />
              Sound Proof
            </AmenityItem>
          )}
        </div>
        <Separator />
        <div className="flex gap-4 justify-between">
          <div>
            Room Price: <span className="font-bold">${Room?.roomPrice}</span>
            <span className="text-xs">/24hrs</span>
          </div>
          {!!Room?.breakfastPrice && (
            <div>
              Breakfast Price:{" "}
              <span className="font-bold">${Room.breakfastPrice}</span>
            </div>
          )}
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <CardTitle>Booking Details</CardTitle>
          <div className="text-primary/90">
            <div>
              Room booked by {booking.userName} for {dayCount} days at{" "}
              {format(new Date(startDate), "MM/dd/yyyy")}
            </div>
            <div>
              Check-in: {format(new Date(startDate), "MM/dd/yyyy")} at 5 pm
            </div>
            <div>
              Check-out: {format(new Date(endDate), "MM/dd/yyyy")} at 5 pm
            </div>
            {booking.breakfastIncluded && (
              <div>Breakfast will be served at 8 AM</div>
            )}
            {booking.paymentStatus ? (
              <div className="text-teal-500">
                Paid ${booking.totalPrice} - Room Reserved
              </div>
            ) : (
              <div className="text-rose-500">
                Not Paid ${booking.totalPrice}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button
          disabled={bookingIsLoading}
          variant="outline"
          onClick={() => router.push(`/hotel-details/${Hotel.id}`)}
        >
          View Hotel
        </Button>
        {!booking.paymentStatus && booking.userId === userId && (
          <Button disabled={bookingIsLoading} onClick={() => handleBookRoom()}>
            {bookingIsLoading ? "Processing..." : "Pay Now"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MyBookingForm;
