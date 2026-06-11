# Navigation by Creation

A demo of navigating a high-dimensional embedding space by *creating*, not browsing.

A corpus of short essays on a topic (default: **redistribution of wealth**), written
from ~24 distinct perspectives, is embedded with an on-device sentence-embedding
model and laid out in 2D with UMAP. You write your own essay on the same topic,
and as you edit, your essay is re-embedded and re-projected into the map —
you steer your position in the space by changing what you say and how you say it.
Your path through the space is drawn as a trail, and your K nearest neighbors
update live.

## Stack

Plain HTML / CSS / JS — no build step, no framework. Browser-side dependencies
are loaded from CDNs at runtime:

- [`@huggingface/transformers`](https://github.com/huggingface/transformers.js) —
  `Xenova/all-MiniLM-L6-v2` (384-dim sentence embeddings), running in a web worker.
  Model weights (~25 MB) download once and are cached by the browser.
- [`umap-js`](https://github.com/PAIR-code/umap-js) — 2D layout with cosine
  distance; the user essay is projected with `umap.transform()` so the base map
  stays stable while you move.

## Run

Any static file server works (ES modules require http, not `file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Use

1. Wait for the model to load and the seed corpus to embed (first load only).
2. Write or paste an essay on the topic in the left pane — after a pause in
   typing, your gold star appears on the map.
3. Steer: borrow vocabulary, arguments, or tone from a cluster and watch
   yourself move toward it. Click any point (or neighbor in the list) to read
   that essay; "Start from this essay" loads it into your editor as a vehicle.

## Generating a corpus on any topic

The bundled seed essays make the demo self-contained, but the **Generate corpus**
button builds an entirely new perspective space on a topic of your choosing,
using `anthropic/claude-opus-4.6` on Replicate via the
[ITP-IMA proxy](https://itp-ima-replicate-proxy.web.app/).

1. Sign in at the proxy page and copy your auth token.
2. Open settings (gear icon) and paste the token (stored in localStorage).
3. Click **Generate corpus**, enter a topic and a perspective count.

Generation is two-phase: one call asks Claude to invent N distinct
perspectives clustered into named groups (which become the legend colors);
then essays are written in parallel batches of ~6 per call. The result is
saved in localStorage; "Restore seed corpus" in settings reverts to the
bundled essays.

## Files

```
index.html          UI shell
css/style.css       styles
js/app.js           orchestration, UMAP layout, canvas map, interactions
js/seed-essays.js   bundled corpus (24 perspectives) + group colors
js/embedder.js      worker client + localStorage embedding cache
js/embed-worker.js  transformers.js feature-extraction pipeline (web worker)
js/llm.js           corpus generation via OpenAI-compatible proxy
```

## Next steps (ideas)

- Firebase backend: persist essays + embeddings, let real people's essays
  replace the LLM-generated ones, shared map across visitors.
- Animate the user point between positions; show ghost positions of other
  live writers.
- Toggle between UMAP layout and raw nearest-neighbor force layout.
