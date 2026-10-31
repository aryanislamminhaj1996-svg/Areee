require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// A single failed request must never take the whole server down.
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err && err.message ? err.message : err));
process.on('uncaughtException', (err) => console.error('Uncaught exception:', err && err.message ? err.message : err));

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

connectDB().then(async () => {
  try {
    const Admin = require('./models/Admin');
    const phone = process.env.ADMIN_PHONE;
    const password = process.env.ADMIN_PASSWORD;
    if (phone && password && !(await Admin.findOne({ phone }))) {
      await Admin.create({ name: process.env.ADMIN_NAME || 'Admin', phone, password });
      console.log('✅ অ্যাডমিন তৈরি হয়েছে');
    }
  } catch (e) {
    console.error('অ্যাডমিন তৈরি ব্যর্থ:', e.message);
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admins', require('./routes/admins'));
app.use('/api/upload', require('./routes/upload'));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date() }));

// Serve the frontend (single deployment: backend + frontend together)
// HTML/JSON never gets cached by the browser so admin changes always show up
// immediately for customers; static assets like images keep normal caching.
const publicDir = path.join(__dirname, '..', 'public');
app.use(
  express.static(publicDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  })
);
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Last-resort error handler: always answer with JSON, never an HTML error page.
app.use((err, req, res, next) => {
  console.error('Server error:', err && err.message ? err.message : err);
  if (res.headersSent) return next(err);
  res.status(err && err.status ? err.status : 500).json({ message: 'সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 সার্ভার চালু হয়েছে: http://localhost:${PORT}`));