# rss-lang-filter

A simple service that filters RSS feeds to only show content in a specific language.

## How It Works

This service fetches an RSS feed from a provided URL and filters out items that are not in the specified language. It uses [efficient-language-detector](https://github.com/distinctdan/efficient-language-detector) to determine the language of each item by analyzing the title and description content.

## Installation

```
npm install
npm run dev
```

## Usage

The service provides an API endpoint (`/feed`) that accepts two parameters:

- `url`: The URL of the RSS feed you want to filter (required) - **must be URL encoded**
- `lang`: The language code you want to keep (default: 'ja' - Japanese)

### Example

```
http://localhost:3000/feed?url=https%3A%2F%2Fexample.com%2Frss&lang=en
```

This will fetch the RSS feed from https://example.com/rss and return only items in English.

## Deployment

To deploy the service:

```
npm run deploy
```

## API Endpoints

- `GET /`: Returns a simple hello message
- `GET /feed`: Filters an RSS feed by language
