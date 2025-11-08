'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ProductData {
  _id: string;
  price: number;
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
}

export default function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  //const { slug } = params;
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductData | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  // Fetch product client-side
  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const query = `*[_type == "product" && slug.current == $slug][0]{
          _id,
          title,
          price,
          description,
          "imageUrl": image.asset->url,
          "slug": slug.current
        }`;
        const data: ProductData | null = await client.fetch(query, { slug: (await params).slug });
        if (!data) notFound();
        setProduct(data);
      } catch (error) {
        console.error('Fetch error:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params]);///------slug

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      _id: product._id,
      title: product.title,
      price: product.price,
      image: product.imageUrl,
      quantity: 1,
    });

    toast.success(`${product.title} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Add to cart
    addItem({
      _id: product._id,
      title: product.title,
      price: product.price,
      image: product.imageUrl,
      quantity: 1,
    });

    // Redirect to checkout
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-xl">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="py-12 max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Image
          src={urlFor(product.imageUrl).url()}
          alt={product.title}
          width={500}
          height={500}
          className="w-full h-96 object-contain rounded-lg"
          priority
        />
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-xl font-semibold text-green-600 mb-4">
            PKR {product.price}
          </p>
          <p className="text-gray-700 mb-6">{product.description}</p>
          <div className="flex gap-3">
            <Button size="md" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button variant="outline" size="md" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}