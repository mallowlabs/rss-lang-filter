import app from './index';

describe('Test the application', () => {
  beforeEach(() => {
    const mockedFeed = `<rss version="2.0">
      <channel>
        <title>My Blog</title>
        <link>https://blog.example.com</link>
        <description>My Awesome Blog</description>
        <item>
          <title>タイトル1</title>
          <link>https://blog.example.com/1</link>
          <description>説明1</description>
        </item>
        <item>
          <title>안녕하세요2</title>
          <link>https://blog.example.com/2</link>
          <description>안녕하세요2</description>
        </item>
      </channel>
    </rss>`;

    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response(mockedFeed, { status: 200 }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Should return 200 response', async () => {
    const res = await app.request('http://localhost/');
    expect(res.status).toBe(200);
  });

  it('Should return filtered feed', async () => {
    const res = await app.request('http://localhost/feed');
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(text).toContain('タイトル1');
    expect(text).not.toContain('안녕하세요2');
  });
});
