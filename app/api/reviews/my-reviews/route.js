export async function GET(request) {
  try {
    console.log('My reviews fetch request received');
    const authorization = request.headers.get('Authorization');

    if (!authorization) {
      console.error('Missing Authorization header in my reviews request');
      return new Response(
        JSON.stringify({
          error: 'Authorization header is required',
          timestamp: new Date().toISOString(),
          path: '/api/reviews/my-reviews',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = `${process.env.NEXT_PUBLIC_BACKEND_REVIEW_URL}/reviews/my-reviews`;
    console.log('Fetching my reviews from:', url);

    const response = await fetch(url, {
      headers: { Authorization: authorization },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          reviews: data.reviews.map((review) => ({
            ...review,
            id: review.id || review._id,
            createdAt: review.createdAt || new Date().toISOString(),
          })),
          totalCount: data.reviews.length,
        },
        message: '내 리뷰 목록을 성공적으로 불러왔습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/reviews/my-reviews',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching my reviews:', error);
    return new Response(
      JSON.stringify({
        error: '내 리뷰 목록을 불러오는데 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: '/api/reviews/my-reviews',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
