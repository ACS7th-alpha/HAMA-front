'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CategoryProduct() {
  const [userInfo, setUserInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('수유_이유용품');
  const [childName, setChildName] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();
  const limit = 40;

  // 카테고리 목록 정의
  const categories = [
    { id: '수유_이유용품', name: '수유/이유용품', icon: '🍼' },
    { id: '기저귀_물티슈', name: '기저귀/물티슈', icon: '👶' },
    { id: '스킨케어_화장품', name: '스킨케어/화장품', icon: '🧴' },
    { id: '생활_위생용품', name: '생활/위생용품', icon: '🧼' },
    { id: '침구류', name: '침구류', icon: '🌛' },
    { id: '식품', name: '식품', icon: '🧀' },
    { id: '완구용품', name: '완구용품', icon: '✏️' },
    { id: '패션의류_잡화', name: '패션의류/잡화', icon: '👕' },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    console.log('[CategoryProduct] Loading user data:', {
      hasUserData: !!userData,
      timestamp: new Date().toISOString(),
    });

    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        console.log('[CategoryProduct] Parsed user data:', {
          userInfo: parsedUserData,
          hasChildren: parsedUserData.children?.length > 0,
          firstChildName: parsedUserData.children?.[0]?.name,
        });
        setUserInfo(parsedUserData);
        if (parsedUserData.children && parsedUserData.children.length > 0) {
          setChildName(parsedUserData.children[0].name);
        }
      } catch (error) {
        console.error('[CategoryProduct] Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      console.log('[CategoryProduct] Fetching products:', {
        category,
        page,
        limit,
        timestamp: new Date().toISOString(),
      });

      setLoading(true);
      try {
        let url = '/api/search/category';
        if (category !== '전체') {
          const encodedCategory = encodeURIComponent(category);
          url += `?category=${encodedCategory}&page=${page}&limit=${limit}`;
        } else {
          url += `?page=${page}&limit=${limit}`;
        }

        const response = await fetch(url, {
          headers: {
            'Cache-Control': 'no-store',
          },
        });

        const data = await response.json();

        if (data.success) {
          setProducts(data.data);
          // 전체 페이지 수 계산 (백엔드에서 받은 total 사용)
          const total = data.meta.total;
          setTotalPages(Math.ceil(total / limit));

          console.log('[CategoryProduct] Products loaded:', {
            productsCount: data.data.length,
            totalProducts: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
          });
        }
      } catch (error) {
        console.error('[CategoryProduct] Error:', error);
        setProducts([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category, page]); // category나 page가 변경될 때마다 실행

  const handleCategoryClick = (categoryId) => {
    console.log('[CategoryProduct] Category clicked:', {
      from: category,
      to: categoryId,
      timestamp: new Date().toISOString(),
    });
    setCategory(categoryId);
    setPage(1);
  };

  // Get the current page range (5 pages per group)
  const getPageRange = () => {
    const startPage = Math.floor((page - 1) / 5) * 5 + 1;
    const endPage = Math.min(startPage + 4, totalPages);
    console.log('[CategoryProduct] Page range calculated:', {
      currentPage: page,
      startPage,
      endPage,
      totalPages,
    });
    return { startPage, endPage };
  };

  const { startPage, endPage } = getPageRange();

  // 컴포넌트 마운트 시 저장된 상태와 스크롤 위치 복원
  useEffect(() => {
    const savedPage = sessionStorage.getItem('prevPage');
    const savedCategory = sessionStorage.getItem('prevCategory');
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');

    console.log('[CategoryProduct] Restoring saved state:', {
      savedPage,
      savedCategory,
      savedScrollPosition,
      timestamp: new Date().toISOString(),
    });

    if (savedPage) {
      setPage(parseInt(savedPage));
      sessionStorage.removeItem('prevPage');
    }
    if (savedCategory) {
      setCategory(savedCategory);
      sessionStorage.removeItem('prevCategory');
    }
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem('scrollPosition');
      }, 100);
    }
  }, []);

  // 상품 클릭 핸들러 추가
  const handleProductClick = (uid) => {
    console.log('[CategoryProduct] Product clicked:', {
      uid,
      timestamp: new Date().toISOString(),
    });
    router.push(`/product/${uid}`);
  };

  return (
    <div className="min-h-screen bg-white mt-12">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center flex items-center justify-center gap-3">
          <span className="text-3xl">
            {childName ? `${childName}맘 주목 카테고리` : '맘 주목 카테고리'}
          </span>
        </h1>

        {/* 카테고리 버튼 */}
        <div className="mb-24 mt-12">
          <div className="flex flex-wrap justify-center gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`
                    w-20 h-20 // 동그라미 크기 조정
                    rounded-full 
                    flex items-center justify-center
                    transition-all duration-200
                    ${
                      category === cat.id
                        ? 'bg-orange-400 text-white shadow-lg transform scale-110'
                        : 'bg-orange-50 text-gray-700 hover:bg-pink-100 hover:scale-105'
                    }
                `}
                >
                  <span className="text-4xl">{cat.icon}</span>
                </button>
                <span className="text-l font-medium text-gray-700">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 상품 목록 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-bounce text-4xl">🍼</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.uid}
                  onClick={() => handleProductClick(product.uid)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-pink-100 hover:border-pink-200 cursor-pointer"
                >
                  <div className="relative group">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-l font-medium text-gray-700 line-clamp-2">
                        {product.brand}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-lg font-medium text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
                      {product.name}
                    </h2>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {product.site}
                        </p>
                        <p className="text-xl font-bold text-black">
                          {product.sale_price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500">
                  해당 카테고리의 상품이 없습니다 🎈
                </p>
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-full bg-white text-gray-700 border-2 border-pink-200 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← 이전
                </button>

                {/* 페이지 번호 */}
                <div className="flex gap-2">
                  {Array.from(
                    { length: endPage - startPage + 1 },
                    (_, i) => startPage + i
                  ).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`
                        w-10 h-10 rounded-full
                        ${
                          pageNum === page
                            ? 'bg-pink-100 text-pink-600'
                            : 'bg-white hover:bg-pink-50 text-gray-700'
                        }
                        font-medium
                      `}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {endPage < totalPages && (
                  <button
                    onClick={() => setPage(endPage + 1)}
                    className="px-4 py-2 rounded-full bg-white text-gray-700 border-2 border-pink-200 hover:bg-pink-50"
                  >
                    다음 →
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
