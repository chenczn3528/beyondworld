import pinyinMap from "../assets/pinyin_map.json";

const normalizeQuery = (query) =>
  query
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

export const getTextMatch = (text, query) => {
  if (!text || !query) return null;
  if (text.includes(query)) {
    return { type: "direct", query };
  }
  const normalized = normalizeQuery(query);
  if (!normalized) return null;
  const entry = pinyinMap[text];
  if (!entry) return null;
  const useFull = normalized.length >= 4;
  if (useFull) {
    if (entry.full?.includes(normalized)) {
      return { type: "pinyin", mode: "full", query: normalized };
    }
    if (entry.initials?.startsWith(normalized)) {
      return { type: "pinyin", mode: "initials", query: normalized };
    }
    return null;
  }
  if (entry.initials?.startsWith(normalized)) {
    return { type: "pinyin", mode: "initials", query: normalized };
  }
  return null;
};

export const matchesText = (text, query) => Boolean(getTextMatch(text, query));

export const normalizeSearchQuery = normalizeQuery;

const findMatchIndices = (text, query) => {
  if (!text || !query) return null;
  const textChars = Array.from(text);
  const queryChars = Array.from(query);
  if (queryChars.length === 0 || queryChars.length > textChars.length) return null;
  for (let i = 0; i <= textChars.length - queryChars.length; i += 1) {
    let ok = true;
    for (let j = 0; j < queryChars.length; j += 1) {
      if (textChars[i + j] !== queryChars[j]) {
        ok = false;
        break;
      }
    }
    if (ok) {
      const indices = new Set();
      for (let k = 0; k < queryChars.length; k += 1) indices.add(i + k);
      return indices;
    }
  }
  return null;
};

export const getHighlightIndices = (text, query) => {
  if (!text || !query) return null;
  const directIndices = findMatchIndices(text, query);
  if (directIndices) return directIndices;

  const normalized = normalizeQuery(query);
  if (!normalized) return null;
  const entry = pinyinMap[text];
  if (!entry) return null;
  const syllables = entry.syllables || [];
  if (!Array.isArray(syllables) || syllables.length === 0) return null;

  const useFull = normalized.length >= 4;
  if (!useFull) {
    if (!entry.initials?.startsWith(normalized)) return null;
    let remaining = normalized.length;
    const indices = new Set();
    syllables.forEach((syllable, index) => {
      if (!syllable || remaining <= 0) return;
      indices.add(index);
      remaining -= 1;
    });
    return indices.size > 0 ? indices : null;
  }

  if (entry.full?.includes(normalized)) {
    const start = entry.full.indexOf(normalized);
    const end = start + normalized.length;
    let cursor = 0;
    const indices = new Set();
    syllables.forEach((syllable, index) => {
      if (!syllable) return;
      const nextCursor = cursor + syllable.length;
      if (nextCursor > start && cursor < end) {
        indices.add(index);
      }
      cursor = nextCursor;
    });
    return indices.size > 0 ? indices : null;
  }

  if (entry.initials?.startsWith(normalized)) {
    let remaining = normalized.length;
    const indices = new Set();
    syllables.forEach((syllable, index) => {
      if (!syllable || remaining <= 0) return;
      indices.add(index);
      remaining -= 1;
    });
    return indices.size > 0 ? indices : null;
  }
  return null;
};
