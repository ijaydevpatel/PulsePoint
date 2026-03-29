import Parser from 'rss-parser';
import * as cheerio from 'cheerio';

const parser = new Parser({
  customFields: {
    item: ['description', 'content:encoded', 'enclosure', 'media:content', 'media:thumbnail'],
  }
});

// Helper to extract first image from various RSS fields
const extractImage = (item) => {
  // 1. Check Media:Thumbnail (Common in BBC/Reuters)
  if (item['media:thumbnail'] && item['media:thumbnail'].$ && item['media:thumbnail'].$.url) {
    return item['media:thumbnail'].$.url;
  }

  // 2. Check Enclosure
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.includes('image')) {
    return item.enclosure.url;
  }
  
  // 3. Check Media:Content
  if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
    return item['media:content'].$.url;
  }

  // 4. Parse HTML description/content with Cheerio
  const html = item.description || item['content:encoded'] || item.content;
  if (!html) return null;
  const $ = cheerio.load(html);
  
  // Google News RSS puts images in <img> tags inside the description
  const img = $('img').first();
  const src = img.attr('src');
  
  // Sanitization: Avoid tiny icons or trackers
  if (src && !src.includes('pixel') && !src.includes('tracker') && src.length > 10) {
    // If it's a relative URL, it's likely broken for external use
    if (src.startsWith('//')) return `https:${src}`;
    if (src.startsWith('http')) return src;
  }
  
  return null;
};

const getFallbackImage = (title = "", category = "") => {
    const t = title.toLowerCase();
    const c = category.toLowerCase();
    if (t.includes('vaccine') || c.includes('vaccine')) return "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600&q=80";
    if (t.includes('brain') || t.includes('neural')) return "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80";
    if (t.includes('heart') || t.includes('cardiac')) return "https://images.unsplash.com/photo-1536064479547-7ee40b74bb5b?w=600&q=80";
    if (t.includes('doctor') || t.includes('hospital')) return "https://images.unsplash.com/photo-1519494140681-8b17d830a3e9?w=600&q=80";
    if (t.includes('dna') || t.includes('gene')) return "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80";
    return "https://images.unsplash.com/photo-1576091160550-217359f42f8c?w=600&q=80"; // Neutral clinical fallback
};

export const getNews = async (req, res) => {
  try {
    const { q, category } = req.query;
    
    // SOURCES: Expanded for extreme global density and visual variety
    const SOURCES = [
      { name: "BBC News Health", url: "http://feeds.bbci.co.uk/news/health/rss.xml" },
      { name: "Medical News Today", url: "https://www.medicalnewstoday.com/rss/headlines.xml" },
      { name: "Science Daily Health", url: "https://www.sciencedaily.com/rss/top/health.xml" },
      { name: "Reuters Health", url: "http://feeds.reuters.com/reuters/healthNews" },
      { name: "WebMD News", url: "https://rssfeeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC" },
      { name: "CDC Newsroom", url: "https://tools.cdc.gov/api/v2/resources/media/132608.rss" },
      { name: "WHO Global News", url: "https://www.who.int/rss-feeds/news-english.xml" },
      { name: "Nature Medicine", url: "https://www.nature.com/nm.rss" },
      { name: "The Lancet", url: "https://www.thelancet.com/rssfeed/lancet_current.xml" },
      { name: "NEJM Highlights", url: "https://www.nejm.org/rss/recent_articles.xml" },
      { name: "Global Health Network", url: `https://news.google.com/rss/search?q=${(q || 'medical+health')+'+medical+research+breakthrough'}&hl=en-US&gl=US&ceid=US:en` }
    ];

    const allFeeds = await Promise.all(SOURCES.map(s => parser.parseURL(s.url).catch(() => ({ items: [] }))));
    let items = allFeeds.flatMap((f, i) => f.items.map(item => ({ ...item, sourceBrand: SOURCES[i].name })));

    // 2. Temporal Gating Constants (Inclusive 4-Day Window)
    const now = new Date();
    const threshold = new Date();
    // Inclusive: If today is 29th, show everything from 25th 00:00:00
    threshold.setDate(now.getDate() - 4);
    threshold.setHours(0, 0, 0, 0); 
    const startOf2026 = new Date('2026-01-01');

    // 3. Process and Normalize
    const processedNews = items.map((item, index) => {
      const titleParts = item.title.split(' - ');
      const source = titleParts.length > 1 ? titleParts.pop() : (item.sourceBrand || "Global Medical Network");
      const title = titleParts.join(' - ');
      
      const imageUrl = extractImage(item);
      const pubDate = new Date(item.pubDate);

      let itemCategory = "Global Update";
      const lcTitle = item.title.toLowerCase();
      if (lcTitle.includes('vaccine')) itemCategory = "Vaccines";
      else if (lcTitle.includes('drug') || lcTitle.includes('fda') || lcTitle.includes('medicine')) itemCategory = "Medicine";
      else if (lcTitle.includes('research') || lcTitle.includes('study') || lcTitle.includes('science')) itemCategory = "Research";

      return {
        id: `news_${index}_${pubDate.getTime()}_${Math.random().toString(36).substr(2, 5)}`,
        title,
        snippet: item.contentSnippet?.slice(0, 180).replace(/<\/?[^>]+(>|$)/g, "") || "", // Clean HTML tags
        source: source.trim(),
        date: item.pubDate,
        link: item.link,
        image: imageUrl || getFallbackImage(title, itemCategory),
        category: itemCategory,
        timestamp: pubDate.getTime()
      };
    });

    // 4. Multi-Stage Filtering
    let filteredNews = processedNews;
    const seenLinks = new Set();
    const seenTitles = new Set();
    
    filteredNews = filteredNews.filter(it => {
        const titleKey = it.title.toLowerCase().trim().slice(0, 40); // Fuzzy duplicate detection
        if (seenLinks.has(it.link) || seenTitles.has(titleKey)) return false;
        seenLinks.add(it.link);
        seenTitles.add(titleKey);
        return true;
    });

    if (!q) {
      // INCLUSIVE 4-DAY FILTER
      filteredNews = filteredNews.filter(it => new Date(it.date) >= threshold);
    }

    filteredNews.sort((a, b) => b.timestamp - a.timestamp);
    res.json(filteredNews.slice(0, 40)); // Max 40 for High-Density Grid

  } catch (error) {
    console.error("News Aggregation Fault:", error);
    res.status(500).json({ message: 'News Aggregation Proxy Fault', error: error.message });
  }
};

