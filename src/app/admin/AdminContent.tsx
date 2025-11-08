// app/admin/AdminContent.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { client } from '@/sanity/lib/client';

interface Item {
  _key: string;
  quantity: number;
  product?: { title?: string };
}

interface Order {
  _id: string;
  id: string;
  items: Item[];
  total: number;
  status: string;
  customerEmail: string;
  createdAt: string;
  paymentMethod: string;
}

export default function AdminContent() {
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthorized(true);
      fetchOrders();
    } else {
      alert('Wrong password!');
      setPassword('');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = `*[_type == "order"] | order(createdAt desc) {
        _id, id, total, status, customerEmail, paymentMethod, createdAt,
        items[] {
          _key,
          quantity,
          "product": product-> { title }
        }
      }`;
      const data = await client.fetch(query);
      setOrders(data || []);
    } catch (error) {
      console.error('Orders fetch error:', error);
      alert('Failed to load orders');
    }
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await client.patch(orderId).set({ status: newStatus }).commit();
      await fetch('/api/orders/' + orderId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
      alert(`Status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Update error:', error);
      alert('Update failed');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  if (!authorized) {
    return (
      <div className="py-12 max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <Button type="submit" className="w-full py-3 text-lg">
            Login
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => { setAuthorized(false); setPassword(''); }} variant="outline">
          Logout
        </Button>
      </div>

      {loading ? (
        <p className="text-center">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border p-6 rounded-lg bg-white shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">Order #{order.id}</h3>
                  <p>Email: {order.customerEmail}</p>
                  <p>Method: {order.paymentMethod}</p>
                  <p>Total: PKR {order.total}</p>
                  <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'shipped' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Items:</h4>
                <ul className="text-sm space-y-1">
                  {order.items.map((item) => (
                    <li key={item._key || Math.random().toString(36)}>
                      {item.product?.title || 'Unknown Product'} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                {['paid', 'shipped', 'delivered'].map((status) => (
                  <Button
                    key={status}
                    onClick={() => updateStatus(order._id, status)}
                    disabled={order.status === status}
                    size="sm"
                  >
                    Mark {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}