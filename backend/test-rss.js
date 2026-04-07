import Parser from 'rss-parser';
const parser = new Parser();

async function testRSS() {
    const url = "https://news.google.com/rss/search?q=medical+health+medical+research+breakthrough&hl=en-US&gl=US&ceid=US:en";
    try {
        const feed = await parser.parseURL(url);
        if (feed.items.length > 0) {
            console.log("Latest Date:", feed.items[0].pubDate);
            console.log("Current System Time:", new Date().toISOString());
        } else {
            console.log("No items found");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testRSS();
