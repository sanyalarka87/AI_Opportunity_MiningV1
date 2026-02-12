import { ROLES } from '../../src/constants/authRoles.js';

function getPermissions(role) {
  const base = ['dashboard:read', 'metrics:read'];
  if (role === 'admin') return [...base, 'audit:read', 'export', 'prompt:execute', 'admin'];
  if (role === 'executive' || role === 'analyst') return [...base, 'export', 'prompt:execute'];
  return base;
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = req.headers['x-user-id'] || 'demo-user';
  const roleHeader = req.headers['x-user-role'] || 'executive';
  const role = ROLES.includes(roleHeader) ? roleHeader : 'viewer';

  res.status(200).json({
    userId,
    role,
    permissions: getPermissions(role),
  });
}

