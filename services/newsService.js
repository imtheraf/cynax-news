const axios = require('axios');
const supabase = require('../config/supabase');

class NewsService {
  constructor() {
    this.apiKey = process.env.NEWS_API_KEY;
    this.baseUrl = 'https://newsapi.org/v2';
    this.MAX_ARTICLES = 3000;
    this.DELETE_COUNT = 500;
  }

  async checkAndCleanArticles() {
    try {
      // Get the total count of articles
      const { count, error: countError } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // If we exceed the maximum, delete the oldest articles
      if (count > this.MAX_ARTICLES) {
        const deleteCount = this.DELETE_COUNT;
        
        // Get the IDs of the oldest articles to delete
        const { data: oldestArticles, error: selectError } = await supabase
          .from('articles')
          .select('id')
          .order('published_at', { ascending: true })
          .limit(deleteCount);

        if (selectError) throw selectError;

        const idsToDelete = oldestArticles.map(article => article.id);

        // Delete the oldest articles
        const { error: deleteError } = await supabase
          .from('articles')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) throw deleteError;

        console.log(`Deleted ${deleteCount} oldest articles to maintain limit`);
      }
    } catch (error) {
      console.error('Error managing article limit:', error);
      throw error;
    }
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

      // Check and clean up if we exceed the limit
      await this.checkAndCleanArticles();

      return articles;
    } catch (error) {
      console.error(`Error fetching ${category} news:`, error);
      throw error;
    }
  }
}

module.exports = new NewsService(); 