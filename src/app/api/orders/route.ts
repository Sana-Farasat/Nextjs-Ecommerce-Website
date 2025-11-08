import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/sanity/lib/client';

export async function POST(req: NextRequest) {
  const orderData = await req.json();
  const newOrder = await createOrder(orderData);
  return NextResponse.json(newOrder);
}