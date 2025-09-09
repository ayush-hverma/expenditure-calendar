const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors({
  origin: 'https://manya-s-expenditure-calendar.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// Config
const PORT = process.env.PORT || 10001;
const DEFAULT_ORIGINS = ['http://localhost:10000', 'http://localhost:1000'];
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || DEFAULT_ORIGINS[0];

// Middleware
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : DEFAULT_ORIGINS).concat(FRONTEND_ORIGIN)
);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

// Mongo
const mongoUrl ='mongodb+srv://ayu5hhverma03:ayush2503@expenditure.elmiwyd.mongodb.net/?retryWrites=true&w=majority&appName=expenditure' ;
if (!mongoUrl) {
  console.warn('MONGODB_URL is not set. Please add it to your .env');
}

mongoose
  .connect(mongoUrl, { dbName: process.env.MONGODB_DB || 'calendar' })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

// Models
const expenseSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // ISO date string YYYY-MM-DD
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    label: { type: String, default: '' },
  },
  { timestamps: true }
);

expenseSchema.index({ date: 1, createdAt: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

// Helpers
function getMonthRange(year, month) {
  // month: 1-12
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  return { startStr, endStr };
}

// Routes
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Create a daily expense entry
app.post('/api/expenses/daily', async (req, res) => {
  try {
    const { date, amount, description, label } = req.body || {};
    if (!date || typeof amount !== 'number') {
      return res.status(400).json({ error: 'date and numeric amount are required' });
    }

    const expense = await Expense.create({ date, amount, description: description || '', label: label || '' });
    return res.status(201).json(expense);
  } catch (err) {
    console.error('POST /api/expenses/daily error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expenses for a specific date
app.get('/api/expenses/by-date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const items = await Expense.find({ date }).sort({ createdAt: -1 }).lean();
    return res.json(items);
  } catch (err) {
    console.error('GET /api/expenses/by-date/:date error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an expense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, label, date } = req.body || {};
    const update = {};
    if (typeof amount === 'number') update.amount = amount;
    if (typeof description === 'string') update.description = description;
    if (typeof label === 'string') update.label = label;
    if (typeof date === 'string') update.date = date;

    const doc = await Expense.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('PUT /api/expenses/:id error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Expense.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/expenses/:id error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expenses for a month (grouped by date)
// /api/expenses/daily?year=2025&month=9
app.get('/api/expenses/daily', async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);
    if (!year || !month) {
      return res.status(400).json({ error: 'year and month (1-12) are required' });
    }
    const { startStr, endStr } = getMonthRange(year, month);

    const items = await Expense.find({ date: { $gte: startStr, $lte: endStr } })
      .sort({ date: 1, createdAt: -1 })
      .lean();

    const map = {};
    for (const item of items) {
      if (!map[item.date]) map[item.date] = [];
      map[item.date].push(item);
    }
    return res.json(map);
  } catch (err) {
    console.error('GET /api/expenses/daily error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get monthly totals for a year
// /api/expenses/monthly?year=2025
app.get('/api/expenses/monthly', async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10);
    if (!year) {
      return res.status(400).json({ error: 'year is required' });
    }

    const results = {};
    for (let m = 1; m <= 12; m += 1) {
      const { startStr, endStr } = getMonthRange(year, m);
      const agg = await Expense.aggregate([
        { $match: { date: { $gte: startStr, $lte: endStr } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      results[m] = agg[0]?.total || 0;
    }
    return res.json(results);
  } catch (err) {
    console.error('GET /api/expenses/monthly error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});


