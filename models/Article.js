const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  urlToImage: {
    type: String,
  },
  publishedAt: {
    type: Date,
    required: true,
  },
  source: {
    id: String,
    name: String,
  },
  category: {
    type: String,
    required: true,
    enum: ['business', 'entertainment', 'health', 'science', 'sports', 'technology'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Article', articleSchema); 