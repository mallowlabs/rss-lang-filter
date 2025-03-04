import { Hono } from 'hono'

const app = new Hono()

const FEED_URL = 'https://dev.classmethod.jp/feed/';

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/feed', async (c) => {
  const response = await fetch(FEED_URL);
  const data = await response.text();
  return c.text(data);
})

export default app
