export const product = {
  name: 'product',
  type: 'document',
  title: 'Product',
  fields: [
    { name: 'title', type: 'string', title: 'Title' },
    { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title' } },
    { name: 'image', type: 'image', title: 'Image' },
    { name: 'price', type: 'number', title: 'Price (PKR)' },
    { name: 'description', type: 'text', title: 'Description' },
  ],
};