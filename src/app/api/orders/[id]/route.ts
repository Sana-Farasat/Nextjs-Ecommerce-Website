// import { NextRequest, NextResponse } from 'next/server';
// import { getOrder, getOrders, updateOrderStatus } from '@/sanity/lib/client';
// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });

// export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
//   const { status } = await req.json();
//   await updateOrderStatus(params.id, status);

//   // Get order for email
//    const order = await getOrder(params.id); // Implement getOrder

//   let subject = '', text = '';
//   if (status === 'shipped') {
//     subject = 'Shipment Started';
//     text = `Your order ${params.id} has been shipped.`;
//   } else if (status === 'delivered') {
//     subject = 'Order Delivered!';
//     text = `Your order ${params.id} has been delivered. Thank you!`;
//   }

//    await transporter.sendMail({ from: ..., to: order.customerEmail, subject, text });

//   return NextResponse.json({ success: true });
// }

// app/api/orders/[id]/route.ts
// FIXED: getOrder not defined + email from error

import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, getOrder } from '@/sanity/lib/client'; // getOrder import
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // <-- Await Promise
    const { status } = await req.json();

  // Update status in Sanity
  await updateOrderStatus(id, status);

  // Get order for email
  const order = await getOrder(id); // Now defined

  // Email only if shipped/delivered
  let subject = '', text = '';
  if (status === 'shipped') {
    subject = 'Shipment Started';
    text = `Your order ${order.id} has been shipped.`;
  } else if (status === 'delivered') {
    subject = 'Order Delivered!';
    text = `Your order ${order.id} has been delivered. Thank you!`;
  }

  // Send email if needed
  if (subject && order?.customerEmail) {
    await transporter.sendMail({
      from: `"Ecom Store" <${process.env.EMAIL_USER}>`, // Proper from
      to: order.customerEmail,
      subject,
      text,
    });
  }

  return NextResponse.json({ success: true });
}