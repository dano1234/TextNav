// Navigation by Creation — main app.
// Pipeline: corpus -> on-device embeddings (worker) -> UMAP 2D layout ->
// canvas map. The user's essay is re-embedded as they type and projected
// into the same space with umap.transform(), leaving a trail.

import { UMAP } from "https://cdn.jsdelivr.net/npm/umap-js@1.4.0/+esm";
import { SEED_ESSAYS, GROUPS, TOPIC } from "./seed-essays.js?v=2";
import { Embedder, cosineSim } from "./embedder.js?v=2";
import { generateCorpus } from "./llm.js?v=2";

const K_NEIGHBORS = 5;
const PLACE_K = 8; // neighbors used for map placement
const TRAIL_MAX = 40;
const CORPUS_KEY = "nbc-corpus-v1";

// ---------- state ----------
const state = {
  topic: TOPIC,
  groups: GROUPS,  // {id: {label, color}} for the current corpus
  essays: [],
  vectors: [],     // corpus embeddings, aligned with essays
  positions: [],   // corpus 2D positions, aligned with essays
  umap: null,
  userVec: null,
  userPos: null,
  trail: [],       // recent user positions, oldest first
  neighbors: [],   // [{index, sim}] sorted desc
  sentences: [],   // [{text, vec}] for the user's individual sentences
  satellites: [],  // [{text, pos, bestIndex, sim}] one dot per sentence
  hoverIndex: -1,
  selectedIndex: -1,
  ready: false,
};

const embedder = new Embedder();

// ---------- dom ----------
const $ = (id) => document.getElementById(id);
const canvas = $("map-canvas");
const ctx = canvas.getContext("2d");
const tooltip = $("map-tooltip");
const overlay = $("map-overlay");
const overlayMessage = $("overlay-message");
const overlayDetail = $("overlay-detail");
const statusPill = $("status-pill");
const essayInput = $("essay-input");
const embedStatus = $("embed-status");
const wordCount = $("word-count");
const reader = $("reader");

// ---------- boot ----------
init();

async function init() {
  buildLegend();
  wireEditor();
  wireMapInteraction();
  wireReader();
  wireSettings();
  window.addEventListener("resize", () => {
    resizeCanvas();
    draw();
  });
  resizeCanvas();

  setStatus("loading model", "busy");
  embedder.onProgress = (p) => {
    overlayDetail.textContent = `${p.file} — ${Math.round(p.progress)}%`;
  };
  await embedder.init();

  const stored = loadStoredCorpus();
  await setCorpus(stored?.essays ?? SEED_ESSAYS, stored?.groups ?? GROUPS);

  setStatus("ready", "ready");
  state.ready = true;
  overlay.classList.add("hidden");

  if (essayInput.value.trim()) scheduleUserUpdate();
}

function loadStoredCorpus() {
  try {
    const data = JSON.parse(localStorage.getItem(CORPUS_KEY) || "null");
    if (data && Array.isArray(data.essays) && data.essays.length > 4) {
      state.topic = data.topic ?? state.topic;
      $("topic-label").textContent = state.topic;
      return { essays: data.essays, groups: data.groups ?? GROUPS };
    }
  } catch {}
  return null;
}

async function setCorpus(essays, groups = GROUPS) {
  state.groups = groups;
  buildLegend();
  overlay.classList.remove("hidden");
  overlayMessage.textContent = "Embedding corpus on-device…";
  overlayDetail.textContent = "";

  state.essays = essays;
  state.vectors = await embedder.embedAll(
    essays.map((e) => e.text),
    (done, total) => {
      overlayDetail.textContent = `${done} / ${total} essays embedded`;
    }
  );

  overlayMessage.textContent = "Fitting UMAP layout…";
  overlayDetail.textContent = "";
  await new Promise((r) => setTimeout(r, 30)); // let the overlay paint

  const rng = mulberry32(42); // deterministic layout across reloads
  state.umap = new UMAP({
    nComponents: 2,
    nNeighbors: Math.min(8, essays.length - 1),
    minDist: 0.25,
    spread: 1.0,
    random: rng,
    distanceFn: cosineDistance,
  });
  state.positions = state.umap.fit(state.vectors);

  // Diagonal of the corpus layout, used as the locality scale for placement.
  {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of state.positions) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    state.mapDiag = Math.hypot(maxX - minX, maxY - minY);
  }

  // A corpus change invalidates the user's old projection.
  state.userPos = null;
  state.trail = [];
  state.neighbors = [];
  state.satellites = [];
  if (state.userVec) await updateUserProjection();

  overlay.classList.add("hidden");
  draw();
}

function cosineDistance(a, b) {
  return 1 - cosineSim(a, b);
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- editor: the act of navigation ----------
let debounceTimer = null;
let embedBusy = false;
let embedQueued = false;

// In-memory cache so unchanged sentences aren't re-embedded on every edit.
const sentenceCache = new Map();
const SENTENCE_CACHE_MAX = 1000;

function splitSentences(text) {
  return text
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).filter(Boolean).length >= 4);
}

function wireEditor() {
  essayInput.addEventListener("input", () => {
    const words = essayInput.value.trim().split(/\s+/).filter(Boolean).length;
    wordCount.textContent = words ? `${words} words` : "";
    scheduleUserUpdate();
  });
}

function scheduleUserUpdate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runUserUpdate, 650);
}

async function runUserUpdate() {
  if (!state.ready) return;
  if (embedBusy) {
    embedQueued = true;
    return;
  }

  const text = essayInput.value.trim();
  if (text.split(/\s+/).filter(Boolean).length < 5) {
    state.userVec = null;
    state.userPos = null;
    state.neighbors = [];
    state.sentences = [];
    state.satellites = [];
    draw();
    return;
  }

  embedBusy = true;
  embedStatus.textContent = "embedding…";
  embedStatus.classList.add("active");
  try {
    state.userVec = await embedder.embedOne(text);

    // Per-sentence embeddings (only the ones we haven't seen before).
    const sentences = splitSentences(text);
    const missing = sentences.filter((s) => !sentenceCache.has(s));
    if (missing.length) {
      const vecs = await embedder.embedBatch(missing);
      missing.forEach((s, i) => sentenceCache.set(s, vecs[i]));
      while (sentenceCache.size > SENTENCE_CACHE_MAX) {
        sentenceCache.delete(sentenceCache.keys().next().value);
      }
    }
    state.sentences = sentences.map((s) => ({ text: s, vec: sentenceCache.get(s) }));

    await updateUserProjection();
  } finally {
    embedBusy = false;
    embedStatus.textContent = "";
    embedStatus.classList.remove("active");
    if (embedQueued) {
      embedQueued = false;
      runUserUpdate();
    }
  }
}

function rankAgainstCorpus(vec) {
  return state.vectors
    .map((v, index) => ({ index, sim: cosineSim(vec, v) }))
    .sort((a, b) => b.sim - a.sim);
}

async function updateUserProjection() {
  // All similarities in the full 384-dim space, sorted descending.
  const ranked = rankAgainstCorpus(state.userVec);
  state.neighbors = ranked.slice(0, K_NEIGHBORS);

  // One satellite dot per sentence, placed the same way as the star.
  // Only meaningful once there's more than one sentence.
  state.satellites =
    state.sentences.length > 1
      ? state.sentences.map(({ text, vec }) => {
          const r = rankAgainstCorpus(vec);
          return {
            text,
            pos: interpolatePosition(r.slice(0, PLACE_K + 1)),
            bestIndex: r[0].index,
            sim: r[0].sim,
          };
        })
      : [];

  // Place the user on the map by interpolating near their best-matching
  // essay. (umap-js transform() is unstable for single out-of-sample points
  // on a small corpus — it flings points to the fringes.)
  const pos = interpolatePosition(ranked.slice(0, PLACE_K + 1));
  const moved =
    !state.userPos ||
    Math.hypot(pos[0] - state.userPos[0], pos[1] - state.userPos[1]) > 1e-4;
  if (moved) {
    if (state.userPos) state.trail.push(state.userPos);
    if (state.trail.length > TRAIL_MAX) state.trail.shift();
    state.userPos = pos;
  }

  draw();
}

// Place the user near their single best-matching essay, nudged by other
// nearby neighbors. Two safeguards against "everything averages to the
// middle of the map":
//   1. Similarity weights are measured relative to the (K+1)-th neighbor,
//      so near-tied similarity lists still produce differentiated weights.
//   2. Each neighbor's pull is damped by its map distance from the anchor
//      (the #1 match) — neighbors on the far side of the map can't drag
//      the user toward the center.
function interpolatePosition(ranked) {
  const baseline = ranked[ranked.length - 1].sim;
  const top = ranked.slice(0, -1);
  const [ax, ay] = state.positions[top[0].index];
  const sigma = 0.22 * state.mapDiag;

  let wSum = 0, x = 0, y = 0;
  for (const { index, sim } of top) {
    const [px, py] = state.positions[index];
    const d = Math.hypot(px - ax, py - ay);
    const w =
      Math.max(sim - baseline, 0) ** 2 * Math.exp(-((d / sigma) ** 2));
    x += w * px;
    y += w * py;
    wSum += w;
  }
  if (wSum <= 0) return [ax, ay];
  return [x / wSum, y / wSum];
}

// ---------- map ----------
function resizeCanvas() {
  const wrap = $("map-wrap");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = wrap.clientWidth * dpr;
  canvas.height = wrap.clientHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function dataExtent() {
  const pts = state.userPos
    ? [
        ...state.positions,
        state.userPos,
        ...state.trail,
        ...state.satellites.map((s) => s.pos),
      ]
    : state.positions;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, maxX, minY, maxY };
}

function makeScale() {
  const wrap = $("map-wrap");
  const w = wrap.clientWidth;
  const h = wrap.clientHeight;
  const pad = 56;
  const { minX, maxX, minY, maxY } = dataExtent();
  const sx = (w - 2 * pad) / Math.max(maxX - minX, 1e-9);
  const sy = (h - 2 * pad) / Math.max(maxY - minY, 1e-9);
  const s = Math.min(sx, sy);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return ([x, y]) => [w / 2 + (x - cx) * s, h / 2 + (y - cy) * s];
}

function groupColor(group) {
  return state.groups[group]?.color ?? "#888fa3";
}

function draw() {
  const wrap = $("map-wrap");
  const w = wrap.clientWidth;
  const h = wrap.clientHeight;
  ctx.clearRect(0, 0, w, h);
  if (!state.positions.length) return;

  const scale = makeScale();
  const userXY = state.userPos ? scale(state.userPos) : null;

  // Trail: the path the user has traveled through essay-space.
  if (userXY && state.trail.length) {
    const pts = [...state.trail.map(scale), userXY];
    for (let i = 1; i < pts.length; i++) {
      const t = i / pts.length;
      ctx.strokeStyle = `rgba(245, 196, 82, ${0.06 + 0.4 * t})`;
      ctx.lineWidth = 1 + 1.5 * t;
      ctx.beginPath();
      ctx.moveTo(pts[i - 1][0], pts[i - 1][1]);
      ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
    }
  }

  // Sentence satellites: one small dot per sentence of the user's essay,
  // each tethered to its best-matching corpus essay.
  if (userXY && state.satellites.length) {
    for (const sat of state.satellites) {
      const [sx, sy] = scale(sat.pos);
      const [bx, by] = scale(state.positions[sat.bestIndex]);

      ctx.strokeStyle = `rgba(245, 196, 82, ${0.08 + 0.3 * Math.max(0, sat.sim)})`;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(245, 196, 82, 0.8)";
      ctx.fill();
      ctx.strokeStyle = "#1a1405";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  // Lines to the K nearest neighbors.
  if (userXY) {
    for (const { index, sim } of state.neighbors) {
      const [x, y] = scale(state.positions[index]);
      ctx.strokeStyle = `rgba(245, 196, 82, ${0.12 + 0.45 * Math.max(0, sim)})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(userXY[0], userXY[1]);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  const neighborSet = new Set(state.neighbors.map((n) => n.index));

  // Corpus points + labels.
  ctx.font = "10px Inter, sans-serif";
  state.positions.forEach((p, i) => {
    const [x, y] = scale(p);
    const essay = state.essays[i];
    const isHover = i === state.hoverIndex;
    const isSelected = i === state.selectedIndex;
    const isNeighbor = neighborSet.has(i);
    const r = isHover || isSelected ? 7 : isNeighbor ? 6 : 4.5;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = groupColor(essay.group);
    ctx.globalAlpha = isHover || isSelected || isNeighbor ? 1 : 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;

    if (isHover || isSelected || isNeighbor) {
      ctx.beginPath();
      ctx.arc(x, y, r + 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = isHover || isSelected ? "#ffffff" : "rgba(245,196,82,0.7)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.fillStyle =
      isHover || isSelected ? "rgba(232,234,240,0.95)" : "rgba(154,161,178,0.55)";
    ctx.fillText(shortLabel(essay.perspective), x + r + 4, y + 3);
  });

  // The user: a pulsing star you steer by writing.
  if (userXY) {
    const [x, y] = userXY;
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(245, 196, 82, 0.18)";
    ctx.fill();
    drawStar(x, y, 5, 7, 3.2);
    ctx.fillStyle = "#f5c452";
    ctx.fill();
    ctx.strokeStyle = "#1a1405";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = "600 11px Inter, sans-serif";
    ctx.fillStyle = "#f5c452";
    ctx.fillText("you", x + 12, y + 4);
    ctx.font = "10px Inter, sans-serif";
  }
}

function drawStar(cx, cy, spikes, outerR, innerR) {
  ctx.beginPath();
  let rot = -Math.PI / 2;
  const step = Math.PI / spikes;
  ctx.moveTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
  for (let i = 0; i < spikes; i++) {
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
  }
  ctx.closePath();
}

function shortLabel(s) {
  return s.length > 26 ? s.slice(0, 24) + "…" : s;
}

// ---------- map interaction ----------
function wireMapInteraction() {
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Sentence satellites take priority over corpus points.
    const sat = satelliteAt(mx, my);
    if (sat) {
      if (state.hoverIndex !== -1) {
        state.hoverIndex = -1;
        draw();
      }
      const best = state.essays[sat.bestIndex];
      tooltip.innerHTML = `
        <div class="tt-title">your sentence</div>
        <div class="tt-snippet">&ldquo;${escapeHtml(sat.text)}&rdquo;</div>
        <div class="tt-snippet" style="margin-top:5px">closest: ${escapeHtml(best.perspective)} (${sat.sim.toFixed(2)})</div>`;
      tooltip.style.left = `${Math.min(mx + 14, canvas.clientWidth - 290)}px`;
      tooltip.style.top = `${my + 14}px`;
      tooltip.classList.remove("hidden");
      return;
    }

    const idx = hitTest(mx, my);
    if (idx !== state.hoverIndex) {
      state.hoverIndex = idx;
      draw();
    }
    if (idx >= 0) {
      const essay = state.essays[idx];
      tooltip.innerHTML = `
        <div class="tt-title">${escapeHtml(essay.perspective)}</div>
        <div class="tt-snippet">${escapeHtml(essay.text.slice(0, 160))}…</div>`;
      tooltip.style.left = `${Math.min(mx + 14, canvas.clientWidth - 290)}px`;
      tooltip.style.top = `${my + 14}px`;
      tooltip.classList.remove("hidden");
    } else {
      tooltip.classList.add("hidden");
    }
  });

  canvas.addEventListener("mouseleave", () => {
    state.hoverIndex = -1;
    tooltip.classList.add("hidden");
    draw();
  });

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const idx = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    if (idx >= 0) openReader(idx);
  });
}

function satelliteAt(mx, my) {
  if (!state.satellites.length) return null;
  const scale = makeScale();
  let best = null;
  let bestDist = 9;
  for (const sat of state.satellites) {
    const [x, y] = scale(sat.pos);
    const d = Math.hypot(x - mx, y - my);
    if (d < bestDist) {
      bestDist = d;
      best = sat;
    }
  }
  return best;
}

function hitTest(mx, my) {
  if (!state.positions.length) return -1;
  const scale = makeScale();
  let best = -1;
  let bestDist = 12; // px hit radius
  state.positions.forEach((p, i) => {
    const [x, y] = scale(p);
    const d = Math.hypot(x - mx, y - my);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

// ---------- reader ----------
function wireReader() {
  $("reader-close").addEventListener("click", closeReader);
  $("reader-seed").addEventListener("click", () => {
    const essay = state.essays[state.selectedIndex];
    if (!essay) return;
    essayInput.value = essay.text;
    essayInput.dispatchEvent(new Event("input"));
    closeReader();
    essayInput.focus();
  });
}

function openReader(index) {
  state.selectedIndex = index;
  const essay = state.essays[index];
  $("reader-title").textContent = essay.perspective;
  $("reader-meta").textContent = state.groups[essay.group]?.label ?? "";
  $("reader-body").textContent = essay.text;
  reader.classList.remove("hidden");
  draw();
}

function closeReader() {
  state.selectedIndex = -1;
  reader.classList.add("hidden");
  draw();
}

// ---------- legend ----------
function buildLegend() {
  const legend = $("map-legend");
  legend.innerHTML = "";
  for (const { label, color } of Object.values(state.groups)) {
    const span = document.createElement("span");
    span.className = "legend-item";
    span.innerHTML = `<span class="swatch" style="background:${color}"></span>${escapeHtml(label)}`;
    legend.appendChild(span);
  }
  const user = document.createElement("span");
  user.className = "legend-item";
  user.innerHTML = `<span class="swatch" style="background:#f5c452;border-radius:2px"></span>you (live)`;
  legend.appendChild(user);

  const sat = document.createElement("span");
  sat.className = "legend-item";
  sat.innerHTML = `<span class="swatch" style="background:rgba(245,196,82,0.8);width:6px;height:6px"></span>your sentences`;
  legend.appendChild(sat);
}

// ---------- generation ----------
let generating = false;

function wireSettings() {
  const genDialog = $("generate-dialog");

  $("generate-btn").addEventListener("click", () => {
    $("gen-topic").value = state.topic === TOPIC ? "" : state.topic;
    genDialog.returnValue = "cancel"; // clear stale value from previous open
    genDialog.showModal();
  });

  genDialog.addEventListener("close", () => {
    if (genDialog.returnValue !== "generate") return;
    genDialog.returnValue = "cancel";
    const topic = $("gen-topic").value.trim();
    if (!topic || generating) return;
    runGeneration(topic, parseInt($("gen-count").value, 10));
  });

  $("cfg-restore").addEventListener("click", async () => {
    genDialog.close("cancel");
    localStorage.removeItem(CORPUS_KEY);
    state.topic = TOPIC;
    $("topic-label").textContent = TOPIC;
    setStatus("re-embedding", "busy");
    await setCorpus(SEED_ESSAYS, GROUPS);
    setStatus("ready", "ready");
  });
}

async function runGeneration(topic, count) {
  generating = true;
  const btn = $("generate-btn");
  btn.disabled = true;
  setStatus("generating…", "busy");
  try {
    const { groups, essays } = await generateCorpus(topic, count, (msg) =>
      setStatus(msg, "busy")
    );
    state.topic = topic;
    $("topic-label").textContent = topic;
    localStorage.setItem(CORPUS_KEY, JSON.stringify({ topic, groups, essays }));
    setStatus("re-embedding", "busy");
    await setCorpus(essays, groups);
    setStatus("ready", "ready");
  } catch (err) {
    console.error(err);
    setStatus("generation failed", "");
    alert(`Corpus generation failed:\n${err.message}`);
  } finally {
    generating = false;
    btn.disabled = false;
  }
}

// ---------- misc ----------
function setStatus(text, kind) {
  statusPill.textContent = text;
  statusPill.className = `status-pill ${kind ?? ""}`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}
