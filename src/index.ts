import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { eld } from 'efficient-language-detector-no-dynamic-import';
import { Hono } from 'hono';

const app = new Hono();

const serializer = new XMLSerializer();
const deserializer = new DOMParser();

const FEED_URL = 'https://dev.classmethod.jp/feed/';

const filterFeed = (text: string, language: string) => {
  const doc = deserializer.parseFromString(text, 'text/xml');
  const channel = doc.getElementsByTagName('channel')[0];
  const items = channel.getElementsByTagName('item');
  const deletingItems = Array.from(items).filter((item) => {
    const title = item.getElementsByTagName('title')[0]?.textContent || '';
    const description =
      item.getElementsByTagName('description')[0]?.textContent || '';

    const lang = eld.detect(title + description).language;
    return lang !== language;
  });
  deletingItems.map((item) => channel.removeChild(item));
  return serializer.serializeToString(doc);
};

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.get('/feed', async (c) => {
  const response = await fetch(FEED_URL);
  const data = await response.text();
  const text = filterFeed(data, 'ja');
  return c.text(text);
});

export default app;
