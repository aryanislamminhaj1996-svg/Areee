const express = require('express');
const Announcement = require('../models/Announcement');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await Announcement.find({ active: true }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'নোটিস লোড করা যায়নি' });
  }
});

router.get('/admin', adminAuth, async (req, res) => {
  try {
    const list = await Announcement.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'নোটিস লোড করা যায়নি' });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const message = String(req.body.message || '').trim();
    if (!title || !message) {
      return res.status(400).json({ message: 'শিরোনাম ও বার্তা দুটোই লিখুন' });
    }
    const item = await Announcement.create({ title, message });
    res.status(201).json(item);
  } catch (err) {
    console.error('Announcement create error:', err.message);
    res.status(400).json({ message: 'নোটিস যোগ করা যায়নি', error: err.message });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const item = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'পাওয়া যায়নি' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'আপডেট করা যায়নি', error: err.message });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const item = await Announcement.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'পাওয়া যায়নি' });
    res.json({ message: 'ডিলিট হয়েছে' });
  } catch (err) {
    res.status(400).json({ message: 'ডিলিট করা যায়নি', error: err.message });
  }
});

module.exports = router;
