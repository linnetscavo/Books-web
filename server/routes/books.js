import express from 'express';
import { db, saveDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Get user's favorite books - authentication required
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's favorite book IDs
    const favoriteIds = db.data.favorites
      .filter(f => f.userId === userId)
      .map(f => f.bookId);
    
    // Get the books that match these IDs
    const favoriteBooks = db.data.books
      .filter(book => favoriteIds.includes(book.id))
      .map(book => {
        const owner = db.data.users.find(user => user.id === book.userId);
        return {
          ...book,
          ownerName: owner ? owner.username : 'Неизвестно',
          ownerFullName: owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестно',
          isFavorite: true
        };
      });
    
    res.json(favoriteBooks);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении избранных книг', details: error.message });
  }
});

// Get all books - no authentication required
router.get('/', async (req, res) => {
  try {
    // Add owner information to each book
    const booksWithOwners = db.data.books.map(book => {
      const owner = db.data.users.find(user => user.id === book.userId);
      
      let bookData = {
        ...book,
        ownerName: owner ? owner.username : 'Неизвестно',
        ownerFullName: owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестно'
      };
      
      // If user is authenticated (Check Authorization header), add favorite status
      if (req.headers.authorization) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
          
          // Check if book is in user's favorites
          const isFavorite = db.data.favorites.some(
            fav => fav.bookId === book.id && fav.userId === decoded.userId
          );
          
          bookData.isFavorite = isFavorite;
        } catch (err) {
          // If token is invalid, isFavorite will be false
          bookData.isFavorite = false;
        }
      } else {
        bookData.isFavorite = false;
      }
      
      return bookData;
    });
    
    res.json(booksWithOwners);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении книг', details: error.message });
  }
});

// Get a specific book - no authentication required
router.get('/:id', async (req, res) => {
  try {
    const book = db.data.books.find(b => b.id === parseInt(req.params.id));
    if (!book) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    
    // Add owner information
    const owner = db.data.users.find(user => user.id === book.userId);
    let bookWithOwner = {
      ...book,
      ownerName: owner ? owner.username : 'Неизвестно',
      ownerFullName: owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестно'
    };
    
    // Add favorite status if user is authenticated
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
        
        // Check if book is in user's favorites
        const isFavorite = db.data.favorites.some(
          fav => fav.bookId === book.id && fav.userId === decoded.userId
        );
        
        bookWithOwner.isFavorite = isFavorite;
      } catch (err) {
        bookWithOwner.isFavorite = false;
      }
    } else {
      bookWithOwner.isFavorite = false;
    }
    
    res.json(bookWithOwner);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении книги', details: error.message });
  }
});

// Add a new book - authentication required
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, author, year, genre, description, coverUrl, isFavorite } = req.body;

    // Validate required fields
    if (!title || !author || !year || !genre || !description) {
      return res.status(400).json({ error: 'Не все обязательные поля заполнены' });
    }

    // Create new book with userId from auth middleware
    const newBook = {
      id: db.data.books.length ? Math.max(...db.data.books.map(b => b.id)) + 1 : 1,
      title,
      author,
      year,
      genre,
      description,
      coverUrl: coverUrl || null,
      isFavorite: isFavorite || false,
      userId: req.user.id
    };

    // Add book to database
    db.data.books.push(newBook);
    await saveDb();

    // Find owner information
    const owner = db.data.users.find(user => user.id === req.user.id);
    const bookWithOwner = {
      ...newBook,
      ownerName: owner ? owner.username : 'Неизвестно',
      ownerFullName: owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестно'
    };

    res.status(201).json(bookWithOwner);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при добавлении книги', details: error.message });
  }
});

// Update a book - authentication required and can only update their own books or admin can update any
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const bookIndex = db.data.books.findIndex(b => b.id === bookId);

    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }

    const book = db.data.books[bookIndex];
    const user = db.data.users.find(u => u.id === req.user.id);
    const isAdmin = user && user.role === 'admin';
    
    // Check if the user is the owner of the book or an admin
    if (book.userId !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'У вас нет прав на редактирование этой книги' });
    }

    // Update book data
    const updatedBook = {
      ...book,
      ...req.body,
      id: bookId,
      userId: book.userId // Preserve the original owner
    };

    db.data.books[bookIndex] = updatedBook;
    await saveDb();

    // Add owner information to response
    const owner = db.data.users.find(user => user.id === updatedBook.userId);
    const bookWithOwner = {
      ...updatedBook,
      ownerName: owner ? owner.username : 'Неизвестно',
      ownerFullName: owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестно'
    };

    res.json(bookWithOwner);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении книги', details: error.message });
  }
});

// Delete a book - authentication required and only if no reviews or user is owner or admin
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const bookIndex = db.data.books.findIndex(b => b.id === bookId);

    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }

    const book = db.data.books[bookIndex];
    const user = db.data.users.find(u => u.id === req.user.id);
    const isAdmin = user && user.role === 'admin';
    
    // Check if book has reviews
    const hasReviews = db.data.reviews.some(r => r.bookId === bookId);
    
    if (hasReviews) {
      return res.status(403).json({ error: 'Невозможно удалить книгу с отзывами' });
    }
    
    // Check if the user is the owner of the book or an admin
    if (book.userId !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'У вас нет прав на удаление этой книги' });
    }

    // Remove the book
    db.data.books.splice(bookIndex, 1);
    await saveDb();

    res.json({ message: 'Книга успешно удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении книги', details: error.message });
  }
});

// Toggle favorite status - authentication required
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Check if book exists
    const bookExists = db.data.books.some(b => b.id === bookId);
    if (!bookExists) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    
    // Check if this book is already in user's favorites
    const existingFavorite = db.data.favorites.find(f => f.bookId === bookId && f.userId === userId);
    
    if (existingFavorite) {
      // If already a favorite, remove it
      db.data.favorites = db.data.favorites.filter(f => !(f.bookId === bookId && f.userId === userId));
      await saveDb();
      
      res.json({ 
        isFavorite: false,
        message: 'Книга удалена из избранного'
      });
    } else {
      // If not a favorite, add it
      const newFavorite = {
        id: db.data.favorites.length ? Math.max(...db.data.favorites.map(f => f.id)) + 1 : 1,
        userId,
        bookId
      };
      
      db.data.favorites.push(newFavorite);
      await saveDb();
      
      res.json({ 
        isFavorite: true,
        message: 'Книга добавлена в избранное'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при изменении статуса избранного', details: error.message });
  }
});

export default router; 