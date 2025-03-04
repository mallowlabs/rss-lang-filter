import { Hono } from 'hono'
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

const app = new Hono()

const serializer = new XMLSerializer();
const deserializer = new DOMParser();

const FEED_URL = 'https://dev.classmethod.jp/feed/';

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/feed', async (c) => {
  const response = await fetch(FEED_URL);
  const data = await response.text();

  const doc = deserializer.parseFromString(data, 'text/xml');

  const channel = doc.getElementsByTagName('channel')[0];

  const items = channel.getElementsByTagName('item');
  const deletingItems = Array.from(items).filter((item, index) => {
    const title = item.getElementsByTagName('title')[0];
    return title.textContent?.includes('[Update]');
  });
  deletingItems.forEach((item) => channel.removeChild(item));

  const text = serializer.serializeToString(doc);
  return c.text(text);
})

export default app
