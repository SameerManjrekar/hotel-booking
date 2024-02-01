"use client";

import useBookRoom from "@/hooks/useBookRoom";
import {
  AddressElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { Separator } from "../ui/separator";
import { endOfDay, intlFormat, isWithinInterval, startOfDay } from "date-fns";
import { Button } from "../ui/button";
import { CreditCardIcon, LucideBanknote, Terminal } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Booking } from "@prisma/client";

type RoomPaymentFormProps = {
  clientSecret: string;
  handlePaymentSuccess: (value: boolean) => void;
};

type DateRangesType = {
  startDate: Date;
  endDate: Date;
};

const RoomPaymentForm = ({
  clientSecret,
  handlePaymentSuccess,
}: RoomPaymentFormProps) => {
  const { bookingRoomData, resetBookRoom } = useBookRoom();
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!stripe) return;
    if (!clientSecret) return;
    handlePaymentSuccess(false);
    setIsLoading(false);
  }, [stripe]);

  const hasOverlap = (
    startDate: Date,
    endDate: Date,
    dateRanges: DateRangesType[]
  ) => {
    const targetInterval = {
      start: startOfDay(new Date(startDate)),
      end: endOfDay(new Date(endDate)),
    };

    for (const range of dateRanges) {
      const rangeStart = startOfDay(new Date(range.startDate));
      const rangeEnd = endOfDay(new Date(range.endDate));

      if (
        isWithinInterval(targetInterval.start, {
          start: rangeStart,
          end: rangeEnd,
        }) ||
        isWithinInterval(
          targetInterval.end,
          {
            start: rangeStart,
            end: rangeEnd,
          } ||
            (targetInterval.start < rangeStart && targetInterval.end > rangeEnd)
        )
      ) {
        return true;
      }
    }

    return false;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(false);

    if (!stripe || !elements || !bookingRoomData) {
      return toast({
        variant: "destructive",
        description: "Data is not present for payment",
      });
    }

    try {
      // check hotel bookings for date overlap

      const bookings = await axios.get(
        `/api/booking/${bookingRoomData.room.id}`
      );

      const roomBookingDates = bookings.data.map((booking: Booking) => {
        return {
          startDate: booking.startDate,
          endDate: booking.endDate,
        };
      });

      const overlapFound = hasOverlap(
        bookingRoomData.startDate,
        bookingRoomData.endDate,
        roomBookingDates
      );

      if (overlapFound) {
        setIsLoading(false);
        return toast({
          variant: "destructive",
          description:
            "Oops! Some of the days you are trying to book have already been reserved. Please go back and select different dates or rooms",
        });
      }

      setIsLoading(true);
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (!result.error) {
        const response = await axios.patch(
          `/api/booking/${result.paymentIntent.id}`
        );
        if (response.status === 200) {
          toast({
            variant: "success",
            description: "Payment successful!",
          });
          router.refresh();
          resetBookRoom();
          handlePaymentSuccess(true);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        return toast({
          variant: "destructive",
          description: "Error in making payment",
        });
      }
    } catch (error) {
      setIsLoading(false);
      return toast({
        variant: "destructive",
        description: "Error in making payment",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} id="payment-form">
      <h2 className="font-semibold mb-2 text-lg">Billing Address</h2>
      <AddressElement
        options={{
          mode: "billing",
          allowedCountries: ["US", "IN", "CR"],
        }}
      />
      <h2 className="font-semibold mt-4 mb-2 text-lg">Payment Information</h2>
      <PaymentElement options={{ layout: "tabs" }} />
      <div className="flex flex-col gap-1">
        <Separator />
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-lg mb-1 mt-4">
            Your Booking Summary
          </h2>
          <div className="text-muted-foreground">
            You will check-in on{" "}
            {intlFormat(bookingRoomData?.startDate as Date)} at 5 pm
          </div>
          <div className="text-muted-foreground">
            You will check-out on {intlFormat(bookingRoomData?.endDate as Date)}{" "}
            at 5 pm
          </div>
          {bookingRoomData?.breakfastIncluded && (
            <div className="text-muted-foreground">
              You will be served breakfast each day at 8 am
            </div>
          )}
        </div>
        <Separator />
        <div className="font-bold text-lg">
          {bookingRoomData?.breakfastIncluded && (
            <div className="mb-2">
              Breakfast Price: ${bookingRoomData.room.breakfastPrice}
            </div>
          )}
          Total Price: ${bookingRoomData?.totalPrice}
        </div>
      </div>
      {isLoading && (
        <Alert className="bg-indigo-600 text-white">
          <Terminal className="size-4 stroke-white" />
          <AlertTitle>Payment Processing...</AlertTitle>
          <AlertDescription>
            Payment Processing...Please stay on this page as we process your
            payment
          </AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="mt-4" disabled={isLoading}>
        {isLoading ? (
          <>
            <CreditCardIcon className="size-4 mr-2" />
            Processing Payment
          </>
        ) : (
          <>
            <LucideBanknote className="size-4 mr-2" />
            Pay Now
          </>
        )}
      </Button>
    </form>
  );
};

export default RoomPaymentForm;
