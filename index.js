// linkedin-rss-generator/index.js
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const RSS = require('rss');

const LINKEDIN_URL = 'https://ee.linkedin.com/company/katanamrp';
const OUTPUT_FILE = './public/feed.xml';

async function fetchLinkedInPosts() {
  const { data } = await axios.get(LINKEDIN_URL);
  const $ = cheerio.load(data);
  const items = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const json = JSON.parse($(el).html());
    if (json && json.mainEntityofPage && json.mainEntityofPage['@type'] === 'SocialMediaPosting') {
      const content = json.articleBody || '';
      const link = json.mainEntityofPage['@id'];
      const image = json.image?.contentUrl;

      items.push({
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        description: content,
        url: link,
        image,
        date: new Date(json.datePublished)
      });
    }
  });

  return items;
}

async function generateRSS() {
  const feed = new RSS({
    title: 'Katana LinkedIn Feed',
    description: 'Latest posts from Katana LinkedIn page',
    feed_url: 'https://henc313.github.io/linkedin-rss/feed.xml',
    site_url: LINKEDIN_URL,
    language: 'en',
  });

  const posts = await fetchLinkedInPosts();
  posts.forEach(post => {
    feed.item({
      title: post.title,
      description: post.image
        ? `<p>${post.description}</p><img src="${post.image}" />`
        : post.description,
      url: post.url,
      date: post.date,
    });
  });

  fs.mkdirSync('./public', { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, feed.xml({ indent: true }));
  console.log('✅ RSS feed generated');
}

generateRSS().catch(console.error);

