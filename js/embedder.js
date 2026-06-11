// Main-thread client for the embedding worker, with a localStorage vector
// cache so the corpus isn't re-embedded on every page load.

const CACHE_KEY = "nbc-embedding-cache-v1";
const MODEL_TAG = "minilm-l6-v2";

function textHash(text) {
  // djb2 — fine for cache keys.
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  }
  return `${MODEL_TAG}:${(h >>> 0).toString(36)}:${text.length}`;
}

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full — drop the cache rather than crash.
    localStorage.removeItem(CACHE_KEY);
  }
}

export class Embedder {
  constructor() {
    this.worker = new Worker(new URL("./embed-worker.js?v=2", import.meta.url), {
      type: "module",
    });
    this.nextId = 1;
    this.pending = new Map();
    this.onProgress = null;
    this.readyPromise = new Promise((resolve) => {
      this._resolveReady = resolve;
    });

    this.worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "ready") {
        this._resolveReady();
      } else if (msg.type === "progress") {
        this.onProgress?.(msg);
      } else if (msg.type === "result") {
        const p = this.pending.get(msg.id);
        if (p) {
          this.pending.delete(msg.id);
          p.resolve(msg.vectors);
        }
      } else if (msg.type === "error") {
        if (msg.id != null && this.pending.has(msg.id)) {
          const p = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          p.reject(new Error(msg.message));
        } else {
          console.error("Embedding worker error:", msg.message);
        }
      }
    };
  }

  init() {
    this.worker.postMessage({ type: "init" });
    return this.readyPromise;
  }

  _embedRaw(texts) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ type: "embed", id, texts });
    });
  }

  /** Embed one string (no caching — used for the live user essay). */
  async embedOne(text) {
    const [vec] = await this._embedRaw([text]);
    return vec;
  }

  /** Embed several strings without persistent caching (live user sentences). */
  embedBatch(texts) {
    return this._embedRaw(texts);
  }

  /** Embed many strings with localStorage caching (used for the corpus). */
  async embedAll(texts, onBatch) {
    const cache = loadCache();
    const vectors = new Array(texts.length).fill(null);
    const missing = [];

    texts.forEach((t, i) => {
      const cached = cache[textHash(t)];
      if (cached) vectors[i] = cached;
      else missing.push(i);
    });

    const BATCH = 4;
    for (let b = 0; b < missing.length; b += BATCH) {
      const idxs = missing.slice(b, b + BATCH);
      const result = await this._embedRaw(idxs.map((i) => texts[i]));
      idxs.forEach((i, j) => {
        vectors[i] = result[j];
        cache[textHash(texts[i])] = result[j];
      });
      onBatch?.(Math.min(b + BATCH, missing.length), missing.length);
    }

    if (missing.length > 0) saveCache(cache);
    return vectors;
  }
}

export function cosineSim(a, b) {
  // Vectors from the model are already L2-normalized, so dot product = cosine.
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}
