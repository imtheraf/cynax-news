const cron = require('node-cron');
const newsService = require('./newsService');

const categories = ['business', 'entertainment', 'health', 'science', 'sports', 'technology'];

const updateAllNews = async () => {
  console.log('Starting news update...');
  for (const category of categories) {
    try {
      await newsService.fetchNewsByCategory(category);
      console.log(`Updated ${category} news`);
      // Add delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to update ${category} news:`, error);
    }
  }
  console.log('News update completed');
};

const initCronJobs = () => {
  // Run every 12 hours
  cron.schedule('0 */4 * * *', updateAllNews);
  
  // Run immediately on startup
  updateAllNews();
};

module.exports = { initCronJobs }; 