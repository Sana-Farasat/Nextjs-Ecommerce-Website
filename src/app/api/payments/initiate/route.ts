// app/api/payments/initiate/route.ts
// Fixed: `req.ip` error (Next.js 15 App Router mein `req.ip` nahi hota)
// Ab `x-forwarded-for` header se IP le rahe hain (safe fallback ke saath)

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, email, payment_method = 'card' } = body;

    if (!orderId || !amount || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const txnId = `TXN${Date.now()}`;
    const returnUrl = `${req.headers.get('origin')}/api/payments/verify?orderId=${orderId}`;
    const cancelUrl = `${req.headers.get('origin')}/checkout?failed=true`;

    let orderDesc = `Order ${orderId}`;
    if (payment_method === 'easypaisa') {
      orderDesc += ' - Pay with EasyPaisa';
    }

    // Fix: IP address safely extract karo
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    const data: Record<string, string> = {
      store_id: process.env.NEXT_PUBLIC_PAYPRO_MERCHANT_ID!,
      txn_id: txnId,
      amount: amount.toString(),
      currency: 'PKR',
      order_desc: orderDesc,
      customer_email: email,
      customer_mobile: '03001234567',
      success_url: returnUrl,
      fail_url: cancelUrl,
      ip_address: ip,
      mode: process.env.PAYPRO_MODE || 'sandbox',
    };

    if (payment_method === 'easypaisa') {
      data.channel = 'easypaisa';
    }

    const hashValues = Object.values(data).join('|');
    const hashString = hashValues + process.env.PAYPRO_SECRET_KEY!;
    const secureHash = crypto.createHmac('sha256', process.env.PAYPRO_SECRET_KEY!)
      .update(hashString)
      .digest('hex');
    data.hash = secureHash;

    const endpoint = process.env.PAYPRO_MODE === 'live'
      ? 'https://paypro.com.pk/gateway/api/create'
      : 'https://sandbox.paypro.com.pk/gateway/api/create';

    const formBody = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      formBody.append(key, value);
    });

    const apiResponse = await fetch(endpoint, {
      method: 'POST',
      body: formBody,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!apiResponse.ok) {
      throw new Error('PayPro API error');
    }

    const result = await apiResponse.json();

    if (result.status === 'success' && result.payment_url) {
      return NextResponse.json({ url: result.payment_url, txnId });
    } else {
      console.error('PayPro response:', result);
      return NextResponse.json({ error: result.message || 'Payment initiation failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('PayPro initiate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}