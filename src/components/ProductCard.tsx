'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/Button';
import { useCartStore } from '@/store/cartStore'; 
import toast from 'react-hot-toast';
import { urlFor } from '@/sanity/lib/image';

interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  image: any;
  price: number;
}

export default function ProductCard({ product }: { product: Product }) {
  // Zustand store se addItem function lo
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    // Product object ko cart item format mein convert karo
    const imageUrl = urlFor(product.image).url(); 
    addItem({
      _id: product._id,
      title: product.title,
      price: product.price,
      image: imageUrl,
      quantity: 1,
    });
    toast.success(`${product.title} added to cart!`);
  };

  return (
    <div className='flex flex-col justify-center items-center sm:flex sm:justify-center sm:items-center'>
    <div className=" bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-fit ">
      <Link href={`/products/${product.slug.current}`}>
        <Image
          src={urlFor(product.image).url()}
          alt={product.title}
          width={500}
          height={500}
          className=" h-40 w-full object-contain"
        />
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
        <p className="text-gray-600 mb-4">PKR {product.price}</p>
        <div className="flex-col space-x-2">
          <Link href={`/products/${product.slug.current}`} className="flex-1">
            <Button variant="outline" size="sm" className="flex-1">
              View Details
            </Button>
          </Link>
          <Button onClick={handleAddToCart} size="sm" className="flex-1">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}