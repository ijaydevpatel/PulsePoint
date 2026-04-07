import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { generateGroqIntelligence } from '../ai-services/groqService.js';

const parser = new Parser({
  customFields: {
    item: ['description', 'content:encoded', 'enclosure', 'media:content', 'media:thumbnail'],
  },
  headers: {
    'User-Agent': 'PulsePoint-Clinical-Intelligence-Aggr-Bot/1.0',
    'Accept': 'application/rss+xml, application/xml, text/xml'
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
  
  const img = $('img').first();
  const src = img.attr('src');
  
  if (src && !src.includes('pixel') && !src.includes('tracker') && src.length > 10) {
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
    return "https://images.unsplash.com/photo-1576091160550-217359f42f8c?w=600&q=80"; 
};

export const getNews = async (req, res) => {
  try {
    const { q } = req.query;
    
    // SOURCES: Multi-Node Clinical Distribution (Verified for 2026 Resilience)
    const SOURCES = [
      { name: "ScienceDaily Health", url: "https://www.sciencedaily.com/rss/health_medicine.xml" },
      { name: "KFF Health News", url: "https://kffhealthnews.org/feed/" },
      { name: "Medical Xpress", url: "https://medicalxpress.com/rss-feed/" },
      { name: "MedPage Today", url: "https://www.medpagetoday.com/rss/headlines.xml" },
      { name: "NIH MedlinePlus News", url: "https://medlineplus.gov/rss/newlinks.xml" },
      { name: "Mayo Clinic Network", url: "https://newsnetwork.mayoclinic.org/feed/" },
      { name: "BBC World Health", url: "https://feeds.bbci.co.uk/news/health/rss.xml" },
      { name: "Global Health Intel", url: `https://news.google.com/rss/search?q=${(q || 'medical+health+vaccine+virus+medicine+medical+research+breakthrough')}&hl=en-US&gl=US&ceid=US:en` }
    ];

    console.log(`[NewsController] Aggregating from ${SOURCES.length} nodes...`);
    const allFeeds = await Promise.all(SOURCES.map(s => parser.parseURL(s.url).catch((err) => {
        console.warn(`[NewsController] Source Fault [${s.name}]: ${err.message}`);
        return { items: [] };
    })));

    let items = allFeeds.flatMap((f, i) => f.items.map(item => ({ ...item, sourceBrand: SOURCES[i].name })));

    // Process and Normalize (High-Resolution Pass)
    const processedNews = items.map((item, index) => {
      const titleParts = item.title.split(' - ');
      const source = titleParts.length > 1 ? titleParts.pop() : (item.sourceBrand || "Global Medical Network");
      const title = titleParts.join(' - ');
      
      const imageUrl = extractImage(item);
      const pubDateString = item.pubDate || item.date || item.isoDate;
      const pubDate = new Date(pubDateString);

      let itemCategory = "Global Update";
      const lcTitle = item.title.toLowerCase();
      if (lcTitle.includes('vaccine')) itemCategory = "Vaccines";
      else if (lcTitle.includes('drug') || lcTitle.includes('fda') || lcTitle.includes('medicine')) itemCategory = "Medicine";
      else if (lcTitle.includes('research') || lcTitle.includes('study') || lcTitle.includes('science')) itemCategory = "Research";

      return {
        id: `news_${index}_${pubDate.getTime()}_${Math.random().toString(36).substr(2, 5)}`,
        title,
        snippet: item.contentSnippet?.slice(0, 180).replace(/<\/?[^>]+(>|$)/g, "") || "", 
        source: source.trim(),
        date: pubDateString,
        link: item.link,
        image: imageUrl || getFallbackImage(title, itemCategory),
        category: itemCategory,
        timestamp: isNaN(pubDate.getTime()) ? Date.now() : pubDate.getTime()
      };
    });

    // Temporal Resilience: 4-Day Freshness Filter with Smart Fallback
    const now = new Date();
    const freshnessThreshold = new Date();
    freshnessThreshold.setDate(now.getDate() - 4);
    freshnessThreshold.setHours(0, 0, 0, 0);

    const seenLinks = new Set();
    const seenTitles = new Set();
    let distinctNews = processedNews.filter(it => {
        const titleKey = it.title.toLowerCase().trim().slice(0, 40); 
        if (seenLinks.has(it.link) || seenTitles.has(titleKey)) return false;
        seenLinks.add(it.link);
        seenTitles.add(titleKey);
        return true;
    });

    let topBriefs = distinctNews
        .filter(it => it.timestamp >= freshnessThreshold.getTime())
        .sort((a, b) => b.timestamp - a.timestamp);

    // DYNAMIC FALLBACK: If 4-day window is empty, show top 40 most recent global articles
    if (topBriefs.length === 0) {
      console.log(`[NewsController] Primary freshness window empty. Relaxing temporal gating...`);
      topBriefs = distinctNews
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 40);
    } else {
      topBriefs = topBriefs.slice(0, 40);
    }

    // Neural Intelligence Summaries (Batch-Processed for High-Fidelity HUD)
    let aiTime = 0;
    let aiModel = "Qwen-3:32B (Active Summarization)";
    
    if (topBriefs.length > 0) {
      try {
        console.log(`[NewsController] Generating Batch Neural Summaries for Top 12...`);
        const batchLines = topBriefs.slice(0, 12).map((it, i) => `${i+1}. ${it.title}`).join('\n');
        
        const summarySystemPrompt = "You are PulsePo!int's Medical Research Analyst. Generate a one-sentence clinical summary for each headline. Output strictly line by line corresponding to the input.";
        const summaryPrompt = `Generate a 1-sentence analytical summary for each of these news items. Focus on 'what is the news about'.\n\nHEADLINES:\n${batchLines}`;

        const aiResult = await generateGroqIntelligence(summaryPrompt, summarySystemPrompt);
        const summaries = aiResult.text.split('\n').filter(s => s.trim().length > 0).map(s => s.replace(/^\d+\.\s*/, '').trim());
        
        aiTime = aiResult.generationTime;
        aiModel = aiResult.model;

        // Apply AI summaries to the top-tier articles
        topBriefs.slice(0, 12).forEach((it, i) => {
            if (summaries[i]) it.snippet = summaries[i];
        });
      } catch (aiError) {
        console.error(`[NewsController] Batch Summarization Fault: ${aiError.message}`);
      }
    }

    // Secondary pass: Generate a global briefing for the remainder
    const neuralBriefing = topBriefs[0]?.snippet || "Intelligence engine re-calibrating global clinical baseline.";

    res.json({
      news: topBriefs,
      neuralPulse: { generationTime: aiTime, model: aiModel },
      neuralBriefing
    });

  } catch (error) {
    console.error("News Aggregation Fault:", error);
    res.status(500).json({ message: 'News Aggregation Proxy Fault', error: error.message });
  }
};

