export async function GET(request, { params }) {
  try {
    console.log('Product detail fetch request received');
    const { uid } = params;

    // 디버깅을 위한 로그
    console.log('Request URL:', request.url);
    console.log('Environment:', {
      BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_SEARCH_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
    console.log('Product ID:', uid);

    if (!uid) {
      console.error('Missing product ID in request');
      return new Response(
        JSON.stringify({
          error: '상품 ID가 필요합니다.',
          timestamp: new Date().toISOString(),
          path: `/api/search/products/${uid}`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = `${process.env.NEXT_PUBLIC_BACKEND_SEARCH_URL}/products/${uid}`;
    console.log('Fetching product detail from:', url);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend product detail fetch error:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();

    // 백엔드 응답 구조 확인을 위한 로그
    console.log('Raw backend response:', JSON.stringify(data, null, 2));

    // 응답 데이터 구조 검증 및 변환
    const productDetail = {
      ...data,
      id: data.id || data._id,
      price: Number(data.price) || 0,
      createdAt: data.createdAt || new Date().toISOString(),
    };

    console.log('Processed product detail:', {
      productId: productDetail.id,
      name: productDetail.name,
      price: productDetail.price,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: productDetail,
        message: '상품 상세 정보를 성공적으로 불러왔습니다.',
        timestamp: new Date().toISOString(),
        path: `/api/search/products/${uid}`,
        meta: {
          productId: productDetail.id,
          fetchedAt: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, private',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('Product Detail API Error:', {
      message: error.message,
      stack: error.stack,
    });
    return new Response(
      JSON.stringify({
        error: '상품 상세 정보를 불러오는데 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: `/api/search/products/${uid}`,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
