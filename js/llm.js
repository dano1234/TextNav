// Corpus generation through the ITP-IMA Replicate proxy, running
// anthropic/claude-opus-4.6.
//
// Generation is two-phase:
//   1. One call invents N distinct perspectives on the topic, clustered
//      into 4-6 named groups.
//   2. Essays are written in parallel batches, one call per ~6 perspectives.

const PROXY_URL = "https://itp-ima-replicate-proxy.web.app/api/create_n_get";
const MODEL = "anthropic/claude-opus-4.6";

// Colors assigned to the LLM-defined groups, in order.
const PALETTE = [
  "#e06c75", "#61afef", "#98c379", "#c678dd",
  "#56b6c2", "#d19a66", "#e5c07b", "#7f8ea3",
];

async function askLLM(prompt, maxTokens = 4096) {
  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      input: { prompt, max_tokens: maxTokens },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Proxy ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = await res.json();
  if (json.error) throw new Error(`Proxy error: ${json.error}`);
  const out = json.output;
  if (out == null) throw new Error("Proxy returned no output");
  return Array.isArray(out) ? out.join("") : String(out);
}

// Models sometimes wrap JSON in markdown fences or preamble; dig it out.
function extractJSON(text) {
  const t = text.replace(/```(?:json)?/gi, "").trim();
  const first = t.search(/[\[{]/);
  const last = Math.max(t.lastIndexOf("]"), t.lastIndexOf("}"));
  if (first === -1 || last <= first) {
    throw new Error(`No JSON found in model reply: ${t.slice(0, 120)}…`);
  }
  return JSON.parse(t.slice(first, last + 1));
}

async function askJSON(prompt, maxTokens) {
  return extractJSON(await askLLM(prompt, maxTokens));
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function planPrompt(topic, count) {
  return `I am building an interactive map of viewpoints on the topic: "${topic}".

Invent exactly ${count} sharply distinct perspectives on this topic. Mix ideological positions, professions, lived experiences, academic disciplines, and spiritual or philosophical traditions. Each perspective label should be 2-5 words (for example "Retired park ranger" or "Marxist historian").

Also define 4 to 6 broad clusters these perspectives loosely belong to, each with a short lowercase one-word id and a 1-3 word label.

Reply with ONLY valid JSON, no markdown fences and no commentary, in exactly this shape:
{"groups":[{"id":"...","label":"..."}],"perspectives":[{"perspective":"...","group":"<group id>"}]}`;
}

function essayPrompt(topic, batch) {
  const list = batch.map((p, i) => `${i + 1}. ${p.perspective}`).join("\n");
  return `Write a short essay on the topic "${topic}" from each of the following perspectives:
${list}

Each essay: 140-190 words, first person, fully in character, vivid and substantive, with at least one concrete argument or example unique to that perspective. No headings, no bullet points, no meta-commentary.

Reply with ONLY valid JSON, no markdown fences: an array in the same order as the list above, shaped as:
[{"perspective":"...","essay":"..."}]`;
}

/**
 * Generate a full corpus for a topic.
 * Returns { groups: {id: {label, color}}, essays: [{id, perspective, group, text}] }
 */
export async function generateCorpus(topic, count, onStatus) {
  onStatus?.("inventing perspectives…");
  const plan = await askJSON(planPrompt(topic, count), 4096);

  const groups = {};
  for (const [i, g] of (plan.groups ?? []).slice(0, PALETTE.length).entries()) {
    groups[g.id] = { label: g.label, color: PALETTE[i] };
  }
  const fallbackGroup = Object.keys(groups)[0];
  if (!fallbackGroup) throw new Error("Model returned no groups");

  const perspectives = (plan.perspectives ?? [])
    .slice(0, count)
    .map((p, i) => ({
      id: slug(p.perspective) || `p${i}`,
      perspective: p.perspective,
      group: groups[p.group] ? p.group : fallbackGroup,
    }));
  if (perspectives.length < 5) throw new Error("Model returned too few perspectives");

  const BATCH = 6;
  const batches = [];
  for (let i = 0; i < perspectives.length; i += BATCH) {
    batches.push(perspectives.slice(i, i + BATCH));
  }

  let done = 0;
  onStatus?.(`writing essays 0/${perspectives.length}…`);
  const results = await Promise.all(
    batches.map(async (batch) => {
      const arr = await askJSON(essayPrompt(topic, batch), 8192);
      done += batch.length;
      onStatus?.(`writing essays ${Math.min(done, perspectives.length)}/${perspectives.length}…`);
      return batch.map((p, i) => ({
        ...p,
        text: String(arr[i]?.essay ?? arr[i]?.text ?? "").trim(),
      }));
    })
  );

  const essays = results.flat().filter((e) => e.text.length > 40);
  if (essays.length < 5) throw new Error("Generation produced too few essays");
  return { groups, essays };
}
