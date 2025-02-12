const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { initCronJobs } = require('./services/cronService');
const articlesRouter = require('./routes/articles');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/articles', articlesRouter);

// Initialize cron jobs
initCronJobs();

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Cynax: all news in one website' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 