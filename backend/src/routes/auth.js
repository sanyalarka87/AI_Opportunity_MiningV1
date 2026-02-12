import { Router } from 'express';

export const authRouter = Router();

const ROLES = ['executive', 'analyst', 'viewer', 'admin'];

authRouter.get('/me', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';
  const role = req.headers['x-user-role'] || 'executive';
  res.json({
    userId,
    role: ROLES.includes(role) ? role : 'viewer',
    permissions: getPermissions(role),
  });
});

function getPermissions(role) {
  const base = ['dashboard:read', 'metrics:read'];
  if (role === 'admin') return [...base, 'audit:read', 'export', 'prompt:execute', 'admin'];
  if (role === 'executive' || role === 'analyst') return [...base, 'export', 'prompt:execute'];
  return base;
}
