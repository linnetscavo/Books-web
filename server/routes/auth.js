import express from 'express';
import bcrypt from 'bcrypt';
import { db, saveDb } from '../db.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Check if username already exists
    if (db.data.users.some(user => user.username === username)) {
      return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: db.data.users.length ? Math.max(...db.data.users.map(u => u.id)) + 1 : 1,
      username,
      password: hashedPassword,
      email
    };

    // Add user to database
    db.data.users.push(newUser);
    await saveDb();

    // Create user object without password for response
    const userForResponse = { ...newUser };
    delete userForResponse.password;

    // Generate token
    const token = generateToken(userForResponse);

    // Debug info for educational purposes
    const debugInfo = {
      message: 'Это информация только для учебных целей!',
      passwordHash: hashedPassword
    };

    res.status(201).json({
      user: userForResponse,
      token,
      debug: debugInfo
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при регистрации пользователя', details: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = db.data.users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }

    // Create user object without password for response
    const userForResponse = { ...user };
    delete userForResponse.password;

    // Generate token
    const token = generateToken(userForResponse);

    // Debug info for educational purposes
    const debugInfo = {
      message: 'Это информация только для учебных целей!',
      passwordHash: user.password
    };

    res.json({
      user: userForResponse,
      token,
      debug: debugInfo
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при входе в систему', details: error.message });
  }
});

export default router; 