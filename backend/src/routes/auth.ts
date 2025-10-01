import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const authRouter = Router();

// Users de test en mémoire (Phase 0)
const users = [
  { id: 1, email: 'admin@hotaly.local', passwordHash: bcrypt.hashSync('password', 8), role: 'admin' },
];

authRouter.post('/login', (req: Request, res: Response) => {
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

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token manquant' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
    (req as any).user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token invalide' });
  }
}

export { authRouter };


