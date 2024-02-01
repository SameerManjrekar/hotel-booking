"use client";

import { Booking } from "@prisma/client";
import { HotelWithRooms } from "./AddHotelForm";
import useLocation from "@/hooks/useLocation";
import Image from "next/image";
import AmenityItem from "../AmenityItem";
import {
  Coffee,
  Dumbbell,
  Hotel,
  MapPin,
  ParkingCircle,
  ShoppingBag,
  Tent,
  Theater,
  WashingMachine,
  Waves,
  Wifi,
  Wine,
} from "lucide-react";
import RoomCard from "../room/RoomCard";

interface HotelDetailsComponentProps {
  hotel: HotelWithRooms;
  bookings?: Booking[];
}

const HotelDetailsComponent = ({
  hotel,
  bookings,
}: HotelDetailsComponentProps) => {
  const { getCountryByCode, getStateByCode } = useLocation();

  const country = getCountryByCode(hotel.country);
  const state = getStateByCode(hotel.country, hotel.state);
  return (
    <div className="flex flex-col gap-6 pb-2">
      <div className="aspect-square overflow-hidden relative w-full h-[200px] md:h-[400px] rounded-lg">
        <Image src={hotel.image} fill alt={hotel.title} />
      </div>
      <div>
        <h3 className="font-semibold text-xl md:text-3xl">{hotel.title}</h3>
        <div className="font-semibold mt-4">
          <AmenityItem>
            <MapPin className="size-4" />
            {country?.name} {!!state?.name && state?.name}{" "}
            {!!hotel.city && hotel?.city}
          </AmenityItem>
        </div>
        <h3 className="font-semibold mt-4 mb-2 text-lg">Location Details</h3>
        <p className="text-primary/90 mb-2">{hotel.locationDescription}</p>
        <h3 className="font-semibold mt-4 mb-2 text-lg">About This Hotel</h3>
        <p className="text-primary/90 mb-2">{hotel.description}</p>
        <h3 className="font-semibold mt-4 mb-2 text-lg">Popular Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 content-start text-sm">
          {hotel.swimmingPool && (
            <AmenityItem>
              <Waves className="size-4" /> Pool
            </AmenityItem>
          )}
          {hotel.swimmingPool && (
            <AmenityItem>
              <Dumbbell className="size-4" /> Gym
            </AmenityItem>
          )}
          {hotel.spa && (
            <AmenityItem>
              <Tent className="size-4" /> Spa
            </AmenityItem>
          )}
          {hotel.bar && (
            <AmenityItem>
              <Wine className="size-4" /> Bar
            </AmenityItem>
          )}
          {hotel.laundry && (
            <AmenityItem>
              <WashingMachine className="size-4" /> Laundry
            </AmenityItem>
          )}
          {hotel.restaurant && (
            <AmenityItem>
              <Hotel className="size-4" /> Restaurant
            </AmenityItem>
          )}
          {hotel.shopping && (
            <AmenityItem>
              <ShoppingBag className="size-4" /> Shopping
            </AmenityItem>
          )}
          {hotel.freeParking && (
            <AmenityItem>
              <ParkingCircle className="size-4" /> Free Parking
            </AmenityItem>
          )}
          {hotel.freeWifi && (
            <AmenityItem>
              <Wifi className="size-4" /> Free Wifi
            </AmenityItem>
          )}
          {hotel.movieNights && (
            <AmenityItem>
              <Theater className="size-4" /> Movie Nights
            </AmenityItem>
          )}
          {hotel.coffeeShop && (
            <AmenityItem>
              <Coffee className="size-4" /> Coffee Shop
            </AmenityItem>
          )}
        </div>
      </div>
      {!!hotel.rooms.length && (
        <div className="mt-3">
          <h3 className="text-lg font-semibold mb-2">Hotel Rooms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {hotel.rooms.map((room) => (
              <RoomCard
                hotel={hotel}
                room={room}
                key={room.id}
                bookings={bookings}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetailsComponent;
