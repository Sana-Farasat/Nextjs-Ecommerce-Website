export default function ThankYou({ params }: { params: { orderId: string } }) {
  return (
    <div className="py-12 text-center">
      <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
      <p>Your order {params.orderId} has been placed successfully.</p>
      <p>Check your email for confirmation.</p>
    </div>
  );
}