import { Router } from 'express';
import { db } from '../database/db';

export const authRouter = Router();

// Login verification
authRouter.post('/login', (req, res) => {
  const { username, role } = req.body;

  const users = db.getUsers();
  let user = users.find(u => u.username.toLowerCase() === (username || '').toLowerCase());

  if (!user && role) {
    user = users.find(u => u.role === role);
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials or role' });
  }

  return res.json({
    success: true,
    user,
    token: `pragati_jwt_${user.id}_${Date.now()}`
  });
});

// Get current user profile
authRouter.get('/me', (req, res) => {
  const users = db.getUsers();
  return res.json({ success: true, user: users[0] });
});

// List all system users (for admin user management)
authRouter.get('/users', (req, res) => {
  const users = db.getUsers();
  return res.json({ success: true, users });
});
