// app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/sanity/lib/client';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const txnId = url.searchParams.get('txn_id');
  const orderId = url.searchParams.get('order_ref'); // PayPro sends order_ref
  const amount = url.searchParams.get('amount');
  const hash = url.searchParams.get('hash');

  // Verify hash
  const expectedHashString = `${status}|${txnId}|${orderId}|${amount}${process.env.PAYPRO_SECRET_KEY}`;
  const expectedHash = crypto.createHmac('sha256', process.env.PAYPRO_SECRET_KEY!)
    .update(expectedHashString)
    .digest('hex');

  if (hash !== expectedHash) {
    return NextResponse.redirect(`${req.headers.get('origin')}/checkout?error=invalid_hash`);
  }

  if (status === 'success') {
    // Update order to paid
    await updateOrderStatus(orderId!, 'paid');

    // Send thank you email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'customer@example.com', // Ideally store in order
      subject: 'Order Confirmed!',
      text: `Your order ${orderId} has been paid. Amount: PKR ${amount ? parseInt(amount) / 100 : 0}`,
    });

    return NextResponse.redirect(`${req.headers.get('origin')}/thank-you/${orderId}`);
  } else {
    return NextResponse.redirect(`${req.headers.get('origin')}/checkout?error=payment_failed`);
  }
}