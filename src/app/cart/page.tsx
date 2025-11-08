"use client";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";
import { Trash2 } from "lucide-react";

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } =
    useCartStore();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Cart is empty!");
      return;
    }
    // Navigate to checkout
    window.location.href = "/checkout";
  };

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        Cart is empty. <Link href="/products">Shop now</Link>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {items.map((item) => (
        <div
          key={item._id}
          className="flex items-center justify-between border-b py-4"
        >
          <Image
            src={item.image}
            alt={item.title}
            height={700}
            width={700}
            className="w-20 h-20 object-cover mr-4"
          />
          <div className="flex-1">
            <h3>{item.title}</h3>
            <p>
              PKR {item.price} x {item.quantity}
            </p>
          </div>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
            className="w-16 border px-2 py-1"
          />
          <Button
            onClick={() => removeItem(item._id)}
            className="bg-red-500 text-white ml-0.5 hover:bg-red-700"
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <div className="text-right mt-8">
        <p className="text-xl font-bold">Total: PKR {getTotal()}</p>
        <Button onClick={handleCheckout} className="mt-4">
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
