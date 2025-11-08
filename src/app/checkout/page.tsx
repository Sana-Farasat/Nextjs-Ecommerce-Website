'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { generateOrderId } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { v4 as uuidv4 } from 'uuid';

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paypro' | 'easypaisa' | 'bank_transfer' | 'cod'>('paypro');
  const total = getTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Email is required!');
      return;
    }

    if (items.length === 0) {
      toast.error('Cart is empty!');
      return;
    }

    // Generate Order ID
    const orderId = generateOrderId();

    // Prepare Order Data for Sanity
    const orderData = {
      id: orderId,
      items: items.map((i) => ({
        product: { _ref: i._id },
        quantity: i.quantity,
        _key: uuidv4(), // Unique key
      })),
      total,
      status: 'pending',
      customerEmail: email,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    // Step 1: Save Order in Sanity
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!orderRes.ok) {
      toast.error('Failed to create order. Try again.');
      return;
    }

    // Step 2: Handle Payment Method
    if (paymentMethod === 'cod') {
      // COD: Send email + redirect
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Cash on Delivery - Order Confirmed',
          text: `Thank you for your order!\n\nOrder ID: ${orderId}\nTotal: PKR ${total}\n\nPay the delivery agent in cash when your order arrives.\n\nWe will notify you when it's shipped.`,
        }),
      });

      clearCart();
      toast.success('COD Order Placed!');
      window.location.href = `/thank-you/${orderId}`;
      return;
    }

    if (paymentMethod === 'bank_transfer') {
      // Bank Transfer: Send instructions
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Bank Transfer - Payment Instructions',
          text: `Order ID: ${orderId}\nTotal: PKR ${total}\n\nPlease transfer to:\nBank: HBL\nAccount Title: Ecom Store PK\nAccount Number: 1234-5678-9012-3456\nIBAN: PK12HBL01234567890123456\n\nAfter payment, send proof to support@ecompk.com\n\nWe will ship once confirmed.`,
        }),
      });

      clearCart();
      toast.success('Bank transfer instructions sent!');
      window.location.href = `/thank-you/${orderId}`;
      return;
    }

    // Step 3: PayPro / EasyPaisa (Online Payment)
    const payRes = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        amount: total * 100, // Convert to paisa
        email,
        payment_method: paymentMethod === 'easypaisa' ? 'easypaisa' : 'card',
      }),
    });

    const payData = await payRes.json();

    if (payData.url) {
      clearCart();
      window.location.href = payData.url; // Redirect to PayPro
    } else {
      toast.error(payData.error || 'Payment failed. Try again.');
    }
  };

  return (
    <div className="py-12 max-w-2xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4">
          <h2 className="font-semibold mb-2">Order Summary</h2>
          {items.map((item) => (
            <div key={item._id} className="flex justify-between text-sm py-1">
              <span>{item.title} × {item.quantity}</span>
              <span>PKR {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 font-bold text-lg flex justify-between">
            <span>Total</span>
            <span>PKR {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="paypro"
                checked={paymentMethod === 'paypro'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="mr-3"
              />
              <span className="flex-1">Credit/Debit Card (via PayPro)</span>
            </label>

            <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="easypaisa"
                checked={paymentMethod === 'easypaisa'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="mr-3"
              />
              <span className="flex-1">EasyPaisa Wallet</span>
            </label>

            <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="bank_transfer"
                checked={paymentMethod === 'bank_transfer'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="mr-3"
              />
              <span className="flex-1">Bank Transfer</span>
            </label>

            <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="mr-3"
              />
              <span className="flex-1">Cash on Delivery (COD)</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-3 text-lg font-semibold"
          disabled={!email || items.length === 0}
        >
          {paymentMethod === 'cod' || paymentMethod === 'bank_transfer'
            ? 'Place Order'
            : 'Proceed to Pay'}
        </Button>
      </form>

      {/* Footer Note */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Secured by PayPro • All transactions are encrypted
      </p>
    </div>
  );
}