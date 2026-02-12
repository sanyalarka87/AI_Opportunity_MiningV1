import { logAudit } from '../../src/audit.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = req.headers['x-user-id'] || 'anonymous';
  const role = req.headers['x-user-role'] || 'viewer';
  const { title, html } = req.body || {};

  logAudit({ action: 'export_pdf', userId, role, title });

  res.status(200).json({
    success: true,
    message:
      'PDF export requested. In production, use a server-side PDF generator (e.g., Puppeteer, jsPDF server).',
    payload: { title, snippet: (html || '').slice(0, 200) },
  });
}

