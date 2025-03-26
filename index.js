// index.js
const Parser = require('rss-parser');
const RSS = require('rss');
const fs = require('fs');

const parser = new Parser();
const FEED_URL = 'https://rss.app/feeds/DL6jxPw6d981y5ot.xml';
const OUTPUT_FILE = './feed.xml';

(async () => {
  const original = await parser.parseURL(FEED_URL);

  const feed = new RSS({
    title: 'Katana LinkedIn',
    description: 'Filtered LinkedIn posts for Slack via RSS.app',
    feed_url: 'https://henc313.github.io/linkedin-rss/feed.xml',
    site_url: 'https://ee.linkedin.com/company/katanamrp',
    language: 'en',
  });

  original.items.slice(0, 5).forEach((item) => {
    const cleanTitle = item.title.length > 150 ? item.title.slice(0, 150) + '...' : item.title;
    feed.item({
      title: cleanTitle,
      description: item.content || '',
      url: item.link,
      guid: item.link, // Important: avoid duplicates in Slack
      date: item.pubDate || new Date().toUTCString(),
    });
  });

  fs.writeFileSync(OUTPUT_FILE, feed.xml({ indent: true }));
  console.log('✅ Cleaned RSS feed generated');
})();

