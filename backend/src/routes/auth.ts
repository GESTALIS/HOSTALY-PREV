const { Router } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authRouter = Router();

// Users de test en mémoire (Phase 0)
const users = [
  { id: 1, email: 'admin@hotaly.local', passwordHash: bcrypt.hashSync('password', 8), role: 'admin' },
];

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === email);
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Identifiants invalides' });
  }
  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '12h',
  });
  return res.json({ token });
});

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token manquant' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token invalide' });
  }
}

module.exports = { authRouter, requireAuth };


