import express from 'express';
import Review from '../models/Review.js';

const reviewsRouter = express.Router();

// POST /api/reviews/:productId - Add review for a product
reviewsRouter.post('/:productId', async (req, res) => {
  try {
    const { userId, name, title, comment, rating } = req.body;
    // Only use userId if it looks like a valid ObjectId, else set to null for guests
    let validUserId = null;
    if (userId && /^[a-fA-F0-9]{24}$/.test(userId)) {
      validUserId = userId;
    }
    const review = new Review({
      productId: req.params.productId,
      userId: validUserId,
      name,
      title,
      comment,
      rating
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    console.error('POST /api/reviews/:productId error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/reviews/:productId - Get all reviews for a product
reviewsRouter.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/:productId/summary - Get average rating and star distribution
reviewsRouter.get('/:productId/summary', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId });
    if (!reviews.length) return res.json({ average: 0, total: 0, stars: [0,0,0,0,0] });
    const total = reviews.length;
    const stars = [0,0,0,0,0]; 
    let sum = 0;
    reviews.forEach(r => {
      sum += r.rating;
      stars[5 - r.rating] += 1;
    });
    const average = sum / total;
    res.json({ average, total, stars });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default reviewsRouter;