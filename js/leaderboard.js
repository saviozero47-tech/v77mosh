// Cliente do Ranking Global Top 3 (Netlify Database + fallback localStorage offline)

const STORAGE_ENTRIES_KEY = 'v77_leaderboard_top3_v1';
const STORAGE_NAME_KEY = 'v77_player_name_v1';
const API_URL = '/api/leaderboard';

export function getSavedPlayerName() {
  try {
    return (localStorage.getItem(STORAGE_NAME_KEY) || '').trim().slice(0, 40);
  } catch {
    return '';
  }
}

export function setSavedPlayerName(name) {
  const clean = sanitizeName(name);
  try {
    if (clean) localStorage.setItem(STORAGE_NAME_KEY, clean);
    else localStorage.removeItem(STORAGE_NAME_KEY);
  } catch {
    // ignore storage quota errors
  }
  return clean;
}

export function sanitizeName(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 40);
}

export function qualifiesForTop3(score, top3) {
  const s = Math.floor(Number(score) || 0);
  if (s <= 0) return false;
  const list = Array.isArray(top3) ? top3 : [];
  if (list.length < 3) return true;
  return s > Number(list[list.length - 1]?.score || 0);
}

function readLocalEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_ENTRIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalEntries(entries) {
  try {
    localStorage.setItem(STORAGE_ENTRIES_KEY, JSON.stringify(entries.slice(0, 3)));
  } catch {
    // ignore
  }
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
  });
}

export async function fetchLeaderboard() {
  try {
    const res = await fetch(API_URL, {
      method: 'GET',
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) throw new Error('Non-JSON response');
    const data = await res.json();
    if (!Array.isArray(data.top3)) throw new Error('Invalid payload');
    return {
      mode: 'global',
      top3: data.top3.slice(0, 3),
    };
  } catch {
    const sorted = sortEntries(readLocalEntries()).slice(0, 3);
    return {
      mode: 'local',
      top3: sorted,
    };
  }
}

export async function submitLeaderboardScore({ playerName, characterName, stageName, score, maxCombo }) {
  const cleanScore = Math.floor(Number(score) || 0);
  const cleanName = sanitizeName(playerName) || 'Anônimo V77';
  setSavedPlayerName(cleanName);

  if (cleanScore <= 0) {
    const current = await fetchLeaderboard();
    return { ...current, saved: false, rank: null, inTop3: false, id: null };
  }

  const payload = {
    playerName: cleanName,
    characterName: String(characterName || 'KAOS').slice(0, 32),
    stageName: String(stageName || 'MOSH DE ARMA BRANCA').slice(0, 80),
    score: cleanScore,
    maxCombo: Math.max(0, Math.floor(Number(maxCombo) || 0)),
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) throw new Error('Non-JSON response');
    const data = await res.json();
    if (!Array.isArray(data.top3)) throw new Error('Invalid payload');
    return {
      mode: 'global',
      saved: Boolean(data.saved),
      id: data.id ?? null,
      rank: data.rank != null ? Number(data.rank) : null,
      inTop3: Boolean(data.inTop3),
      top3: data.top3.slice(0, 3),
    };
  } catch {
    const entries = sortEntries(readLocalEntries()).slice(0, 3);
    if (!qualifiesForTop3(cleanScore, entries)) {
      return {
        mode: 'local',
        saved: false,
        id: null,
        rank: null,
        inTop3: false,
        top3: entries,
      };
    }
    const newEntry = {
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
    entries.push(newEntry);
    const top3 = sortEntries(entries).slice(0, 3);
    writeLocalEntries(top3);
    const rankIdx = top3.findIndex((e) => e.id === newEntry.id);
    const rank = rankIdx >= 0 ? rankIdx + 1 : null;
    return {
      mode: 'local',
      saved: rank !== null,
      id: newEntry.id,
      rank,
      inTop3: rank !== null,
      top3,
    };
  }
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderTop3Into(listEl, modeBadgeEl, data, highlightId = null) {
  if (modeBadgeEl) {
    modeBadgeEl.textContent = data.mode === 'global' ? '🌐 GLOBAL' : '💾 LOCAL';
    modeBadgeEl.classList.toggle('is-global', data.mode === 'global');
  }
  if (!listEl) return;

  const medals = ['🥇', '🥈', '🥉'];
  const items = Array.isArray(data.top3) ? data.top3.slice(0, 3) : [];

  if (items.length === 0) {
    listEl.innerHTML = `<div class="lb-empty">NINGUÉM ENTROU NO PÓDIO AINDA — QUEBRE TUDO E INAUGURE O TOP 3!</div>`;
    return;
  }

  listEl.innerHTML = items
    .map((entry, idx) => {
      const isMe = highlightId != null && String(entry.id) === String(highlightId);
      return `
        <div class="lb-row rank-${idx + 1} ${isMe ? 'is-highlight' : ''}">
          <span class="lb-medal">${medals[idx] || `#${idx + 1}`}</span>
          <div class="lb-meta">
            <strong class="lb-name">${escapeHtml(entry.playerName)}</strong>
            <span class="lb-char">${escapeHtml(entry.characterName)} • ${Number(entry.maxCombo || 0)}x</span>
          </div>
          <span class="lb-score">${Number(entry.score || 0).toLocaleString('pt-BR')}</span>
        </div>
      `;
    })
    .join('');
}
