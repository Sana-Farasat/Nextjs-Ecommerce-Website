// // app/not-found.tsx
// // FIXED: useSearchParams() in 404 page error
// // Problem: 404 page uses useSearchParams() → needs Suspense
// // Solution: Create custom not-found.tsx with Suspense

// import { Suspense } from 'react';
// import Link from 'next/link';
// import { Button } from '@/components/ui/Button';

// function NotFoundContent() {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
//       <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
//       <p className="text-xl text-gray-600 mb-8">Oops! Page not found.</p>
//       <Link href="/">
//         <Button size="md">Go Home</Button>
//       </Link>
//     </div>
//   );
// }

// export default function NotFound() {
//   return (
//     <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
//       <NotFoundContent />
//     </Suspense>
//   );
// }

// app/not-found.tsx
import Link from 'next/link';
//import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gray-50">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <Link href="/">
        <button >Go Home</button>
      </Link>
    </div>
  );
}