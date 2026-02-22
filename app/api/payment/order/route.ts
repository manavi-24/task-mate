import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import type { Orders } from "razorpay/dist/types/orders";

type CreateOrderBody = {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string | number>;
};

export async function POST(req: NextRequest) {
  try {
    const {
      amount,
      currency = "INR",
      receipt,
      notes,
    } = (await req.json()) as CreateOrderBody;

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }


    // Use environment variables for security
    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return NextResponse.json({ error: "Razorpay key_id or key_secret missing in environment variables." }, { status: 500 });
    }
    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options: Orders.RazorpayOrderCreateRequestBody = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency,
      receipt: receipt || `rcptid_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ orderId: order.id, order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
