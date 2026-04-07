import Parser from 'rss-parser';
const parser = new Parser();

const SOURCES = [
  { name: "BBC News Health", url: "http://feeds.bbci.co.uk/news/health/rss.xml" },
  { name: "Medical News Today", url: "https://www.medicalnewstoday.com/rss/headlines.xml" },
  { name: "Science Daily Health", url: "https://www.sciencedaily.com/rss/top/health.xml" },
  { name: "Reuters Health", url: "http://feeds.reuters.com/reuters/healthNews" },
  { name: "WebMD News", url: "https://rssfeeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC" },
  { name: "CDC Newsroom", url: "https://tools.cdc.gov/api/v2/resources/media/132608.rss" },
  { name: "WHO Global News", url: "https://www.who.int/rss-feeds/news-english.xml" },
  { name: "Nature Medicine", url: "https://www.nature.com/nm.rss" }
];

async function checkAll() {
    for (const s of SOURCES) {
        try {
            const feed = await parser.parseURL(s.url);
            console.log(`[PASS] ${s.name}: ${feed.items.length} items`);
        } catch (e) {
            console.log(`[FAIL] ${s.name}: ${e.message}`);
        }
    }
}

checkAll();
