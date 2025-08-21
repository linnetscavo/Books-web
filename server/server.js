import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import fs from 'fs';
import { db } from './db.js';



// Import routes
import authRoutes from './routes/auth.js';
import booksRoutes from './routes/books.js';
import reviewsRoutes from './routes/reviews.js';
// Проверка загрузки маршрутов
console.log('--- Проверка импортов ---');
console.log('authRoutes:', authRoutes);
console.log('booksRoutes:', booksRoutes);
console.log('reviewsRoutes:', reviewsRoutes);
console.log('-------------------------');

// Get current directory
const __dirname = dirname(fileURLToPath(import.meta.url));

// Create express app
const app = express();
const PORT = process.env.PORT || 3000;

// Create covers directory if it doesn't exist
const coversDir = join(__dirname, 'public', 'covers');
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

// Configure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, coversDir);
     },
     filename: (req, file, cb) => {
       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = file.originalname.split('.').pop();
      cb(null, `${uniqueSuffix}.${ext}`);
    }

});

const upload = multer({ storage });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(join(__dirname, 'public')));

// CORS is disabled as requested
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
     return res.sendStatus(200);
  }
  next();
});

// File upload route
app.post('/upload/cover', upload.single('cover'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }
  const coverUrl = `/covers/${req.file.filename}`;
    res.json({ coverUrl });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/reviews', reviewsRoutes);

// Direct routes for data access (non-API version)
app.get('/books', (req, res) => {
  // Add owner information to each book
  const booksWithOwners = db.data.books.map(book => {
    const owner = db.data.users.find(user => user.id === book.userId);
  // Basic data without favorite info
    let bookData = {
    ...book,
      ownerName: owner ? owner.username : 'Неизвестно',
      ownerFullName: owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестно',
      isFavorite: false
    };
    return bookData;
});

  res.json(booksWithOwners);

});



app.get('/books/:id', (req, res) => {
const book = db.data.books.find(b => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).json({ error: 'Книга не найдена' });
  }
 // Add owner information
const owner = db.data.users.find(user => user.id === book.userId);
const bookWithOwner = {
 ...book,
  ownerName: owner ? owner.username : 'Неизвестно',
  ownerFullName: owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестно',
  isFavorite: false
  };
  res.json(bookWithOwner);
});



app.get('/user-favorites', (req, res) => {
  // This should be an authenticated route but for simplicity
  // we'll just assume user ID 1 for direct access
  const userId = 1;
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
});


app.get('/reviews', (req, res) => {
   res.json(db.data.reviews);
});

app.get('/reviews/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  const reviews = db.data.reviews.filter(r => r.bookId === bookId);
   res.json(reviews);
});


// Health check route
app.get('/health', (req, res) => {
   res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
   console.error(err.stack);
  res.status(500).json({
     error: 'Что-то пошло не так!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
