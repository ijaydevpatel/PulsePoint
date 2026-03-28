import fetch from 'node-fetch';

// @desc    Fetch and normalize latest Health Industry news
// @route   GET /api/news
// @access  Private
export const getNews = async (req, res) => {
  try {
    // In production, this proxies external medical news APIs natively securely omitting explicit client cross-origin
    // We mock the structural schema returned to the React frontend here:
    
    const mockNewsResponse = [
      { id: 101, title: 'FDA Approves Novel Antibody Treatment', category: 'Biotech', date: '2026-03-24', source: 'Medical Daily' },
      { id: 102, title: 'Advancements in LLM Diagnostic Safety Networks', category: 'Health Tech', date: '2026-03-23', source: 'Tech Health Review' },
      { id: 103, title: 'Cardiac Marker Variations in Modern Diets', category: 'Wellness', date: '2026-03-22', source: 'Journal of Cardiology' }
    ];

    res.json(mockNewsResponse);

  } catch (error) {
    res.status(500).json({ message: 'News Aggregation Proxy Fault', error: error.message });
  }
};
