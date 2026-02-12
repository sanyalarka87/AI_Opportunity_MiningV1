const auditLog = [];

export function logAudit(entry) {
  const record = {
    ...entry,
    timestamp: new Date().toISOString(),
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
  auditLog.push(record);
  return record;
}

export function getAuditLog(query = {}) {
  let list = [...auditLog];
  if (query.userId) list = list.filter((e) => e.userId === query.userId);
  if (query.action) list = list.filter((e) => e.action === query.action);
  if (query.limit) list = list.slice(-Number(query.limit));
  return list;
}
