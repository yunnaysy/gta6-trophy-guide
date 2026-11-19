// Storage and export/import helpers for Leonida Ledger
const STORAGE_KEY = 'gta6-trophy-checklist';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earnedSet) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earnedSet]));
  } catch (err) {
    console.error('Failed to save progress to localStorage', err);
  }
}

export function exportJson(earnedSet, trophies) {
  const payload = {
    app: 'Leonida Ledger',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    totalTrophies: trophies.length,
    earnedCount: earnedSet.size,
    earnedTrophies: [...earnedSet]
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  triggerDownload(blob, 'leonida-ledger-progress.json');
}

export async function importJson(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (Array.isArray(data)) {
    return new Set(data);
  }
  if (data && Array.isArray(data.earnedTrophies)) {
    return new Set(data.earnedTrophies);
  }
  throw new Error('Invalid backup file format');
}

export function exportMarkdown(earnedSet, trophies) {
  const lines = [
    '# Leonida Ledger - GTA VI Trophy Checklist & Guide Backup',
    `Generated on: ${new Date().toLocaleDateString('en-US')}`,
    `Progress: ${earnedSet.size} of ${trophies.length} trophies earned (${Math.round((earnedSet.size / trophies.length) * 100)}%)\n`,
    '| Status | Grade | Trophy Name | Kind | Phase | Description & Strategy |',
    '| :---: | :---: | :--- | :--- | :--- | :--- |'
  ];

  for (const t of trophies) {
    const status = earnedSet.has(t.name) ? '[x] Earned' : '[ ] Locked';
    const desc = `${t.description} -- *${t.guide}*`;
    lines.push(`| ${status} | ${t.grade.toUpperCase()} | ${t.name} | ${t.kind} | Phase ${t.phase} | ${desc.replace(/\|/g, '-')} |`);
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown; charset=utf-8' });
  triggerDownload(blob, 'leonida-ledger-guide-backup.md');
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
