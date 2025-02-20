'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';
import { unstable_noStore as noStore } from 'next/cache';

// SearchContent 컴포넌트로 useSearchParams를 사용하는 부분을 분리
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('query');
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 40;

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;

      setLoading(true);
      try {
        const response = await fetch(
          `/api/products/search?query=${encodeURIComponent(
            query
          )}&page=${currentPage}&limit=${limit}`
        );
        if (!response.ok) {
          throw new Error('검색 실패');
        }

        const data = await response.json();
        console.log('[SearchPage] API Response:', data);

        if (data.success) {
          setProducts(data.data || []);
          // count가 실제 총 상품 수를 나타내므로 이를 사용
          const totalItems = data.count ?? 0;
          const calculatedTotalPages = Math.max(
            Math.ceil(totalItems / limit),
            1
          );
          setTotalPages(calculatedTotalPages);
          setTotalCount(totalItems);
        }
      } catch (error) {
        console.error('[SearchPage] Error:', error);
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b flex justify-center items-center">
        <div className="animate-bounce text-4xl">🔍</div>
      </div>
    );
  }

  const getPageRange = () => {
    const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
    const endPage = Math.min(startPage + 4, totalPages);
    return { startPage, endPage };
  };

  const { startPage, endPage } = getPageRange();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* 검색 결과 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            &ldquo;{query}&rdquo; 검색 결과
          </h1>
          <p className="text-xl text-gray-600">
            총{' '}
            <span className="text-xl font-bold text-orange-500">
              {totalCount}
            </span>
            건의 상품이 있습니다
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">검색 결과가 없습니다 😢</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link
                  key={product.uid}
                  href={`/product/${product.uid}`}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 block"
                >
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="px-5 py-4">
                    <h2 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">
                      {product.name}
                    </h2>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        {product.site}
                      </p>
                      <p className="text-xl font-bold text-black">
                        {product.sale_price}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {products.length > 0 && (
              <div className="flex justify-center items-center gap-1 mt-12">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-6 py-3 rounded-full bg-white text-gray-700 border-2 border-pink-200 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                >
                  ← 이전
                </button>

                {/* 페이지 번호 목록 */}
                <div className="flex gap-1">
                  {Array.from(
                    { length: endPage - startPage + 1 },
                    (_, idx) => startPage + idx
                  ).map((n) => (
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      className={`rounded-full text-pink-600 font-medium ${
                        currentPage === n
                          ? 'bg-pink-100'
                          : 'bg-white hover:bg-pink-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {/* "Next" arrow for the next set of pages */}
                {endPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(endPage + 1)}
                    className="px-6 py-3 rounded-full bg-white text-gray-700 border-2 border-pink-200 hover:bg-pink-50 transition-colors duration-200 font-medium"
                  >
                    → 다음
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function SearchPage() {
  noStore();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
