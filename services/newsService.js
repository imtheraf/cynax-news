const axios = require('axios');
const supabase = require('../config/supabase');

class NewsService {
  constructor() {
    this.apiKey = process.env.NEWS_API_KEY;
    this.baseUrl = 'https://newsapi.org/v2';
  }

  async fetchNewsByCategory(category) {
    try {
      const response = await axios.get(`${this.baseUrl}/top-headlines`, {
        params: {
          country: 'us',
          category,
          apiKey: this.apiKey,
        },
      });

      const articles = response.data.articles.map(article => ({
        title: article.title,
        description: article.description || '',
        content: article.content || '',
        url: article.url,
        url_to_image: article.urlToImage,
        published_at: article.publishedAt,
        source: article.source,
        category,
      }));

      // Delete existing articles in this category
      await supabase
        .from('articles')
        .delete()
        .eq('category', category);

      // Insert new articles
      const { error } = await supabase
        .from('articles')
        .insert(articles);

      if (error) throw error;

      return articles;
    } catch (error) {
      console.error(`Error fetching ${category} news:`, error);
      throw error;
    }
  }
}

module.exports = new NewsService(); 