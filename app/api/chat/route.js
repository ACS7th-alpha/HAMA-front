export async function POST(request) {
  try {
    const authorization = request.headers.get('Authorization');
    const body = await request.json();

    const url = `${process.env.NEXT_PUBLIC_BACKEND_CHAT_URL}/perplexity`;
    console.log('Sending chat message to:', url);
    console.log('Request body:', body);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error in chat:', error);
    return Response.json(
      { error: 'Failed to get chat response', details: error.message },
      { status: 500 }
    );
  }
}
