import express from 'express';
import { db, saveDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all reviews for a book - no authentication required
router.get('/book/:id', async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const reviews = db.data.reviews.filter(r => r.bookId === bookId);
    
    // Enrich reviews with user information (without exposing passwords)
    const enrichedReviews = reviews.map(review => {
      const user = db.data.users.find(u => u.id === review.userId);
      return {
        ...review,
        username: user ? user.username : 'Unknown'
      };
    });
    
    res.json(enrichedReviews);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении отзывов', details: error.message });
  }
});

// Add a new review - authentication required
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { bookId, text, rating } = req.body;

    // Validate required fields
    if (!bookId || !text || rating === undefined) {
      return res.status(400).json({ error: 'Не все обязательные поля заполнены' });
    }

    // Check if book exists
    const book = db.data.books.find(b => b.id === parseInt(bookId));
    if (!book) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }

    // Create new review
    const newReview = {
      id: db.data.reviews.length ? Math.max(...db.data.reviews.map(r => r.id)) + 1 : 1,
      bookId: parseInt(bookId),
      userId: req.user.id,
      text,
      rating: parseInt(rating),
      date: new Date().toISOString()
    };

    // Add review to database
    db.data.reviews.push(newReview);
    await saveDb();

    // Return the review with username
    const enrichedReview = {
      ...newReview,
      username: req.user.username
    };

    res.status(201).json(enrichedReview);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при добавлении отзыва', details: error.message });
  }
});

// Update a review - authentication required and can only update their own reviews
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const reviewIndex = db.data.reviews.findIndex(r => r.id === reviewId);

    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }

    const review = db.data.reviews[reviewIndex];
    
    // Check if the user is the owner of the review
    if (review.userId !== req.user.id) {
      return res.status(403).json({ error: 'У вас нет прав на редактирование этого отзыва' });
    }

    // Update review data
    const updatedReview = {
      ...review,
      text: req.body.text || review.text,
      rating: req.body.rating !== undefined ? parseInt(req.body.rating) : review.rating,
      date: new Date().toISOString() // Update the date when review is modified
    };

    db.data.reviews[reviewIndex] = updatedReview;
    await saveDb();

    // Return the review with username
    const enrichedReview = {
      ...updatedReview,
      username: req.user.username
    };

    res.json(enrichedReview);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении отзыва', details: error.message });
  }
});

// Delete a review - authentication required and can only delete their own reviews
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const reviewIndex = db.data.reviews.findIndex(r => r.id === reviewId);

    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }

    const review = db.data.reviews[reviewIndex];
    
    // Check if the user is the owner of the review
    if (review.userId !== req.user.id) {
      return res.status(403).json({ error: 'У вас нет прав на удаление этого отзыва' });
    }

    // Remove the review
    db.data.reviews.splice(reviewIndex, 1);
    await saveDb();

    res.json({ message: 'Отзыв успешно удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении отзыва', details: error.message });
  }
});

export default router; 