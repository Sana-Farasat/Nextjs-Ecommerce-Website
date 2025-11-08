// 'use client';

// import { useSearchParams } from 'next/navigation';
// import { useState, useEffect } from 'react';
// import { getProducts } from '@/sanity/lib/client';
// import ProductCard from '@/components/ProductCard';
// import { Input } from '@/components/ui/Input';
// import { Search } from 'lucide-react';

// export default function ProductsPage() {
//   const searchParams = useSearchParams();
//   const initialSearch = searchParams.get('search') || '';

//   const [search, setSearch] = useState(initialSearch);
//   const [products, setProducts] = useState<any[]>([]);
//   const [filtered, setFiltered] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch products once
//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       const data = await getProducts();
//       setProducts(data);
//       setLoading(false);
//     };
//     fetchProducts();
//   }, []);

//   // Filter on search change
//   useEffect(() => {
//     if (!products.length) return;

//     const filteredProducts = products.filter((p: any) =>
//       p.title.toLowerCase().includes(search.toLowerCase())
//     );
//     setFiltered(filteredProducts);

//     // Update URL without reload
//     const url = new URL(window.location.href);
//     if (search) {
//       url.searchParams.set('search', search);
//     } else {
//       url.searchParams.delete('search');
//     }
//     window.history.replaceState({}, '', url);
//   }, [search, products]);

//   return (
//     <div className="py-12">
//       <div className="max-w-7xl mx-auto px-4">
//         <h1 className="text-3xl font-bold mb-6">Products</h1>

//         {/* Search Bar */}
//         <div className="relative max-w-md mb-8">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <Input
//             type="text"
//             placeholder="Search products..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="pl-10 pr-4 py-2 w-full"
//           />
//         </div>

//         {/* Loading */}
//         {loading ? (
//           <p className="text-center text-gray-500">Loading products...</p>
//         ) : filtered.length === 0 ? (
//           <p className="text-center text-gray-500">No products found.</p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filtered.map((product: any) => (
//               <ProductCard key={product._id} product={product} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// app/products/page.tsx
import { Suspense } from 'react';
import ProductsContent from './ProductsContent';

export const dynamic = 'force-dynamic'; // Agar Zustand use kar rahe h 

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}