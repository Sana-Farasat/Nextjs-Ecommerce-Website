// schemas/order.ts
export const order = {
  name: 'order',
  type: 'document',
  title: 'Order',
  fields: [
    { name: 'id', type: 'string', title: 'Order ID' },
    { name: 'items', type: 'array', of: [{ type: 'object', fields: [{ name: 'product', type: 'reference', to: [{ type: 'product' }] }, { name: 'quantity', type: 'number' }] }] },
    { name: 'total', type: 'number', title: 'Total (PKR)' },
    { name: 'status', type: 'string', title: 'Status', options: { list: [{ title: 'Pending', value: 'pending' }, { title: 'Paid', value: 'paid' }, { title: 'Shipped', value: 'shipped' }, { title: 'Delivered', value: 'delivered' }] } },
    { name: 'customerEmail', type: 'string', title: 'Customer Email' },
    { name: 'createdAt', type: 'datetime', title: 'Created At' },
    { name: 'paymentMethod', type: 'string', title: 'Payment Method' },//new
  ],
};