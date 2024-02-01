"use client";

import { usePathname, useRouter } from "next/navigation";
import { HotelWithRooms } from "./AddHotelForm";
import { cn } from "@/lib/utils";
import Image from "next/image";
import AmenityItem from "../AmenityItem";
import { Dumbbell, MapPin, Waves } from "lucide-react";
import useLocation from "@/hooks/useLocation";
import { Button } from "../ui/button";

interface HotelCardProps {
  hotel: HotelWithRooms;
}

const HotelCard = ({ hotel }: HotelCardProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const { getCountryByCode } = useLocation();
  const country = getCountryByCode(hotel.country);

  const isMyHotels = pathname.includes("my-hotels");
  return (
    <div
      onClick={() => !isMyHotels && router.push(`/hotel-details/${hotel.id}`)}
      className={cn(
        "col-span-1 cursor-pointer transition hover:scale-105",
        isMyHotels && "cursor-default"
      )}
    >
      <div className="flex bg-background/50 gap-2 border border-primary/10 rounded-lg">
        <div className="flex-1 flex aspect-square overflow-hidden relative w-full h-[210px] rounded-s-lg">
          <Image
            fill
            src={hotel.image}
            alt={hotel.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between h-[210px] hap-1 p-1 py-2 text-sm">
          <h3 className="font-semibold text-xl">{hotel.title}</h3>
          <p className="text-primary/90">
            {hotel.description.substring(0, 45)}...
          </p>
          <div className="text-primary/90">
            <AmenityItem>
              <MapPin className="size-4" /> {country?.name} {hotel.city}
            </AmenityItem>
            {hotel.swimmingPool && (
              <AmenityItem>
                <Waves className="size-4" /> Pool
              </AmenityItem>
            )}
            {hotel.gym && (
              <AmenityItem>
                <Dumbbell className="size-4" /> Gym
              </AmenityItem>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {hotel.rooms[0]?.roomPrice && (
                <>
                  <div className="font-semibold text-base">
                    ${hotel.rooms[0]?.roomPrice}
                  </div>
                  <div className="text-xs">/24hrs</div>
                </>
              )}
            </div>
            {isMyHotels && (
              <Button
                variant="outline"
                onClick={() => router.push(`/hotel/${hotel.id}`)}
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
