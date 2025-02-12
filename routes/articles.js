const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// Test route
router.get('/test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('count');

    if (error) throw error;

    res.json({ message: 'Supabase connection successful', count: data.length });
  } catch (error) {
    res.status(500).json({ 
      message: 'Supabase connection test failed', 
      error: error.message 
    });
  }
});

// Breaking news route - Move this BEFORE the :id route
router.get('/breaking', async (req, res) => {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(5); // Get latest 5 news items

    if (error) throw error;

    res.json(articles || []);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching breaking news', 
      error: error.message 
    });
  }
});

// Search route
router.get('/search', async (req, res) => {
  try {
    const { q: query, page = 1, limit = 10 } = req.query; // Changed 'query' to 'q' to match frontend
    const start = (page - 1) * parseInt(limit);
    const end = start + parseInt(limit) - 1;

    // Use Supabase's text search
    const { data, count, error } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    res.json({
      articles: data || [],
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      totalArticles: count,
      articlesPerPage: parseInt(limit),
      searchQuery: query
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: 'Error searching articles', 
      error: error.message 
    });
  }
});

// Category route
router.get('/category/:category', async (req, res) => {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('category', req.params.category)
      .order('published_at', { ascending: false });

    if (error) throw error;

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Main articles route
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const start = (page - 1) * parseInt(limit);
    const end = start + parseInt(limit) - 1;

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false });

    // Add category filter if provided
    if (category) {
      query = query.eq('category', category.toLowerCase());
    }

    // Add pagination
    query = query.range(start, end);

    const { data, count, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json({
      articles: data || [],
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      totalArticles: count,
      articlesPerPage: parseInt(limit)
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      message: 'Error fetching articles', 
      error: error.message 
    });
  }
});

// Get article by ID - Move this to the END
router.get('/:id', async (req, res) => {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 