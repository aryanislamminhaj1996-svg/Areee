const express = require('express');
const AppSettings = require('../models/AppSettings');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let settings = await AppSettings.findOne({ key: 'main' });
    if (!settings) settings = await AppSettings.create({ key: 'main' });
    res.json(settings);
  } catch (err) {
    console.error('Settings read error:', err.message);
    res.status(500).json({ message: 'সেটিংস লোড করা যায়নি' });
  }
});

router.put('/', adminAuth, async (req, res) => {
  try {
    const settings = await AppSettings.findOneAndUpdate(
      { key: 'main' },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    console.log('Settings saved:', Object.keys(req.body).join(', '), '| appEnabled =', settings.appEnabled);
    res.json(settings);
  } catch (err) {
    console.error('Settings save error:', err.message);
    res.status(400).json({ message: 'সেটিংস সেভ করা যায়নি', error: err.message });
  }
});

module.exports = router;
