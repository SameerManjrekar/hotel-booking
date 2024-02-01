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
  Loader2,
  MountainSnow,
  PencilIcon,
  Ship,
  Trash,
  Trees,
  Tv,
  Users,
  UtensilsCrossed,
  VolumeX,
  Wand2,
  Wifi,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useFormStatus } from "react-dom";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import { useEffect, useMemo, useState } from "react";
import AddRoomForm from "./AddRoomForm";
import { useToast } from "../ui/use-toast";
import axios from "axios";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { DateRange } from "react-day-picker";
import DateRangePicker from "./DateRangePicker";
import { Checkbox } from "../ui/checkbox";
import { useAuth } from "@clerk/nextjs";
import useBookRoom, { RoomDataType } from "@/hooks/useBookRoom";

interface RoomCardProps {
  hotel?: Hotel & {
    rooms: Room[];
  };
  room?: Room;
  bookings?: Booking[];
}

const RoomCard = ({ hotel, room, bookings = [] }: RoomCardProps) => {
  const { setRoomData, paymentIntentId, setClientSecret, setPaymentIntentId } =
    useBookRoom();
  const pathname = usePathname();
  const { toast } = useToast();
  const router = useRouter();
  const { pending } = useFormStatus();
  const [bookingIsLoading, setBookingIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [date, setDate] = useState<DateRange | undefined>();
  const [totalPrice, setTotalPrice] = useState(room?.roomPrice);
  const [includeBreakfast, setIncludeBreakfast] = useState<boolean>(false);
  const [days, setDays] = useState(1);
  const isHotelDetails = pathname.includes("hotel-details");
  const isBookRoom = pathname.includes("book-room");
  const { userId } = useAuth();

  useEffect(() => {
    if (date && date.from && date.to) {
      const dayCount = differenceInCalendarDays(date.to, date.from);
      setDays(dayCount);
      if (dayCount && room?.roomPrice) {
        if (includeBreakfast && room?.breakfastPrice) {
          setTotalPrice(
            dayCount * room.roomPrice + dayCount * room.breakfastPrice
          );
        } else {
          setTotalPrice(dayCount * room.roomPrice);
        }
      } else {
        setTotalPrice(room?.roomPrice);
      }
    }
  }, [date, room?.roomPrice, includeBreakfast]);

  const disabledDates = useMemo(() => {
    let dates: Date[] = [];

    const roomBookings = bookings.filter(
      (booking) => booking.roomId === room?.id && booking.paymentStatus
    );

    roomBookings.forEach((booking) => {
      const range = eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      });

      dates = [...dates, ...range];
    });
    return dates;
  }, [bookings]);

  const handleDialogOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleRoomDelete = async (room: Room) => {
    let response;
    try {
      const imageKey = await room.image.substring(
        room.image.lastIndexOf("/") + 1
      );

      const utResponse = await axios.post("/api/uploadthing/delete", {
        imageKey,
      });
      if (utResponse.status === 200) {
        response = await axios.delete(`/api/room/${room.id}`);
      }

      if (response && response.status === 200) {
        router.refresh();
        toast({
          variant: "success",
          description: "Room deleted successfully!",
        });
      }
    } catch (error: any) {
      console.log(`Error in Deleting Room ${error}`);
      toast({
        variant: "destructive",
        description: `Error in Deleting Room ${error?.message}`,
      });
    }
  };

  const handleBookRoom = async () => {
    try {
      if (!userId)
        return toast({
          variant: "destructive",
          description: "Oops! Make sure you are logged in!",
        });

      if (!hotel?.userId)
        return toast({
          variant: "destructive",
          description: "Something went wrong. Please try again!",
        });

      if (date?.from && date.to) {
        setBookingIsLoading(true);
        const bookingRoomData = {
          room,
          totalPrice,
          breakfastIncluded: includeBreakfast,
          startDate: date.from,
          endDate: date.to,
        };

        // call function from zustand
        setRoomData(bookingRoomData as RoomDataType);

        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking: {
              hotelOwnerId: hotel.userId,
              hotelId: hotel.id,
              roomId: room?.id,
              startDate: date.from,
              endDate: date.to,
              breakfastIncluded: includeBreakfast,
              totalPrice: totalPrice,
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
      } else {
        toast({
          variant: "destructive",
          description: "Please Select Dates!",
        });
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
        <CardTitle>{room?.title}</CardTitle>
        <CardDescription>{room?.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="aspect-square overflow-hidden relative h-[200px] rounded-lg">
          <Image
            fill
            src={room?.image as string}
            alt={room?.title as string}
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 content-start text-sm">
          <AmenityItem>
            <BedIcon className="h-4 w-4" />
            {room?.bedCount} Bed{"(s)"}
          </AmenityItem>
          <AmenityItem>
            <Users className="h-4 w-4" />
            {room?.guestCount} Guest{"(s)"}
          </AmenityItem>
          <AmenityItem>
            <Bath className="h-4 w-4" />
            {room?.bathroomCount} bathrooms{"(s)"}
          </AmenityItem>
          {!!room?.kingBed && (
            <AmenityItem>
              <BedDouble className="h-4 w-4" />
              {room.kingBed} King Bed{"(s)"}
            </AmenityItem>
          )}
          {!!room?.queenBed && (
            <AmenityItem>
              <Bed className="h-4 w-4" />
              {room.queenBed} Queen Bed{"(s)"}
            </AmenityItem>
          )}
          {room?.roomService && (
            <AmenityItem>
              <UtensilsCrossed className="h-4 w-4" />
              {room.queenBed} Room Services
            </AmenityItem>
          )}
          {room?.TV && (
            <AmenityItem>
              <Tv className="h-4 w-4" />
              TV
            </AmenityItem>
          )}
          {room?.balcony && (
            <AmenityItem>
              <Home className="h-4 w-4" />
              Balcony
            </AmenityItem>
          )}
          {room?.freeWifi && (
            <AmenityItem>
              <Wifi className="h-4 w-4" />
              Free Wifi
            </AmenityItem>
          )}
          {room?.cityView && (
            <AmenityItem>
              <Castle className="h-4 w-4" />
              City View
            </AmenityItem>
          )}
          {room?.oceanView && (
            <AmenityItem>
              <Ship className="h-4 w-4" />
              Ocean View
            </AmenityItem>
          )}
          {room?.forestView && (
            <AmenityItem>
              <Trees className="h-4 w-4" />
              Forest View
            </AmenityItem>
          )}
          {room?.mountainView && (
            <AmenityItem>
              <MountainSnow className="h-4 w-4" />
              Mountain View
            </AmenityItem>
          )}
          {room?.airContioner && (
            <AmenityItem>
              <AirVent className="h-4 w-4" />
              Air Conditioner
            </AmenityItem>
          )}
          {room?.soundProof && (
            <AmenityItem>
              <VolumeX className="h-4 w-4" />
              Sound Proof
            </AmenityItem>
          )}
        </div>
        <Separator />
        <div className="flex gap-4 justify-between">
          <div>
            Room Price: <span className="font-bold">${room?.roomPrice}</span>
            <span className="text-xs">/24hrs</span>
          </div>
          {!!room?.breakfastPrice && (
            <div>
              Breakfast Price:{" "}
              <span className="font-bold">${room.breakfastPrice}</span>
            </div>
          )}
        </div>
        <Separator />
      </CardContent>
      {!isBookRoom && (
        <CardFooter>
          {isHotelDetails ? (
            <div className=" flex flex-col gap-6">
              <div>
                <div className="mb-2">
                  Select Days that you will spend in this room!
                </div>
                <DateRangePicker
                  date={date}
                  setDate={setDate}
                  disabledDates={disabledDates}
                />
              </div>
              {(room?.breakfastPrice as number) > 0 && (
                <div>
                  <div className="mb-2">
                    Do you want to be served breakfast each day?
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="breakfast"
                      onCheckedChange={(value) => {
                        setIncludeBreakfast(!!value);
                      }}
                    />
                    <label htmlFor="breakfast" className="text-sm">
                      Include Breakfast
                    </label>
                  </div>
                </div>
              )}
              <div>
                Total Price: <span className="font-bold">${totalPrice}</span>{" "}
                for <span className="font-bold">{days} Days</span>
              </div>
              <Button
                disabled={bookingIsLoading}
                type="button"
                onClick={() => handleBookRoom()}
              >
                {bookingIsLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2" />
                  </>
                ) : (
                  <>
                    <Wand2 className="size-4 mr-2" />
                  </>
                )}
                {bookingIsLoading ? "Loading..." : "Book Room"}
              </Button>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <Button
                disabled={pending}
                type="button"
                variant="destructive"
                onClick={() => handleRoomDelete(room as Room)}
              >
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger>
                  <Button
                    type="button"
                    variant="outline"
                    className="max-w-[150px]"
                  >
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Update Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[900px] w-[90%]">
                  <DialogHeader className="px-2">
                    <DialogTitle>Update Room</DialogTitle>
                    <DialogDescription>
                      Make changes to this room.
                    </DialogDescription>
                  </DialogHeader>
                  <AddRoomForm
                    hotel={hotel}
                    room={room}
                    handleDialogOpen={handleDialogOpen}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default RoomCard;
