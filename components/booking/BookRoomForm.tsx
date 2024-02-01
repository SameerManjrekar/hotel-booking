"use client";

import useBookRoom from "@/hooks/useBookRoom";
import { StripeElementsOptions, loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import RoomCard from "../room/RoomCard";
import RoomPaymentForm from "./RoomPaymentForm";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

const BookRoomForm = () => {
  const { bookingRoomData, clientSecret } = useBookRoom();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: theme === "dark" ? "night" : "stripe",
      labels: "floating",
    },
  };

  const handlePaymentSuccess = (value: boolean) => {
    setPaymentSuccess(value);
  };

  if (pageLoaded && !paymentSuccess && (!bookingRoomData || !clientSecret)) {
    return (
      <div className="flex items-center flex-col gap-4">
        <div className="text-rose-500 text-2xl mb-2">
          Oops! There was an error in making a payment...
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/")}>
            Go Home
          </Button>
          <Button onClick={() => router.push("/my-bookings")}>
            View My Bookings
          </Button>
        </div>
      </div>
    );
  }

  if (paymentSuccess)
    return (
      <div className="flex items-center flex-col gap-4">
        <div className="text-teal-500 text-center text-2xl">
          Payment Successful!
        </div>
        <Button onClick={() => router.push("/my-bookings")}>
          View Bookings
        </Button>
      </div>
    );
  return (
    <div className="max-w-[700px] mx-auto">
      {clientSecret && bookingRoomData && (
        <div>
          <h3 className="text-2xl font-semibold mb-6">
            Complete payment to reserve this room!
          </h3>
          <div className="mb-6">
            <RoomCard room={bookingRoomData.room} />
          </div>
          <Elements options={options} stripe={stripePromise}>
            <RoomPaymentForm
              clientSecret={clientSecret}
              handlePaymentSuccess={handlePaymentSuccess}
            />
          </Elements>
        </div>
      )}
    </div>
  );
};

export default BookRoomForm;
