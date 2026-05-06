const STORAGE_KEY = 'pcr_player_id';

export function getOrCreatePlayerId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const newId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, newId);
    return newId;
  } catch {
    return _sessionFallbackId();
  }
}

export function getPlayerId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return _fallbackId ?? null;
  }
}

export function clearPlayerId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    _fallbackId = null;
  } catch {
    _fallbackId = null;
  }
}

let _fallbackId: string | null = null;

function _sessionFallbackId(): string {
  if (!_fallbackId) _fallbackId = crypto.randomUUID();
  return _fallbackId;
}