import Image from "next/image";
import { getProducts } from "@/sanity/lib/client";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const products = await getProducts(); // Fetch all, show first 6 as featured

  return (
    <main>
      <div>
        <Image
          src={"/cover-image3.jpg"}
          alt="Cover Image"
          width={500}
          height={500}
          className="w-full h-1/2"
        />
      </div>
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">
            Featured Products
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
