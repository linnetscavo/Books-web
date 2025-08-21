import express from 'express';
import bcrypt from 'bcrypt';
import { db, saveDb } from '../db.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email already exists
    if (db.data.users.some(user => user.email === email)) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: db.data.users.length ? Math.max(...db.data.users.map(u => u.id)) + 1 : 1,
      email,
      password: hashedPassword
    };

    // Add user to database
    db.data.users.push(newUser);
    await saveDb();

    // Create user object without password for response
    const userForResponse = { 
      id: newUser.id,
      email: newUser.email
    };

    // Generate token
    const token = generateToken(userForResponse);

    res.status(201).json({
      user: userForResponse,
      token,
      message: 'Пользователь успешно зарегистрирован'
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при регистрации пользователя', details: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = db.data.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Create user object without password for response
    const userForResponse = { 
      id: user.id,
      email: user.email 
    };

    // Generate token
    const token = generateToken(userForResponse);

    res.json({
      user: userForResponse,
      token,
      message: 'Вход выполнен успешно'
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при входе в систему', details: error.message });
  }
});

export default router;