import { currentUser } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import prisma from "@/lib/prismaDB";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { booking, payment_intent_id } = body;

    const bookingData = {
      ...booking,
      userName: user.firstName,
      userId: user.id,
      currency: "usd",
      paymentIntentId: payment_intent_id,
      userEmail: user.emailAddresses[0].emailAddress,
    };

    let foundBooking;

    if (payment_intent_id) {
      foundBooking = await prisma.booking.findUnique({
        where: {
          paymentIntentId: payment_intent_id,
          userId: user.id,
        },
      });
    }

    // console.log("payment_intent_id", { payment_intent_id, foundBooking });

    if (foundBooking && payment_intent_id) {
      // updating booking
      const current_payment_intent = await stripe.paymentIntents.retrieve(
        payment_intent_id
      );
      if (current_payment_intent) {
        const updated_intent = await stripe.paymentIntents.update(
          payment_intent_id,
          {
            amount: booking.totalPrice * 100,
          }
        );

        const response = await prisma.booking.update({
          where: {
            paymentIntentId: payment_intent_id,
            userId: user.id,
          },
          data: bookingData,
        });

        if (!response) {
          return NextResponse.json(
            {
              error: "Error in Updating Payment Intent",
            },
            { status: 500 }
          );
        }

        return NextResponse.json(
          { paymentIntent: updated_intent },
          { status: 200 }
        );
      }
    } else {
      // create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: booking.totalPrice * 100,
        currency: booking.currency,
        automatic_payment_methods: { enabled: true },
      });

      // console.log("paymentIntent", paymentIntent);

      bookingData.paymentIntentId = paymentIntent.id;

      await prisma.booking.create({
        data: bookingData,
      });

      return NextResponse.json({ paymentIntent }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: `Error at /api/create-payment-intent POST request ${error?.message}`,
      },
      { status: 500 }
    );
  }
}
