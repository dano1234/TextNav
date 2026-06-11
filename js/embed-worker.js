// Web worker: runs the sentence-embedding model on-device via transformers.js.
// Model weights are downloaded once from the HuggingFace CDN and cached by the
// browser (Cache Storage), so subsequent loads are fast and offline-capable.

import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.1";

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

let extractorPromise = null;

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL_ID, {
      dtype: "fp32",
      progress_callback: (p) => {
        if (p.status === "progress" && p.file && p.file.endsWith(".onnx")) {
          self.postMessage({
            type: "progress",
            file: p.file,
            progress: p.progress ?? 0,
          });
        }
      },
    });
  }
  return extractorPromise;
}

self.onmessage = async (e) => {
  const msg = e.data;
  try {
    if (msg.type === "init") {
      await getExtractor();
      self.postMessage({ type: "ready", model: MODEL_ID });
    } else if (msg.type === "embed") {
      const extractor = await getExtractor();
      const output = await extractor(msg.texts, {
        pooling: "mean",
        normalize: true,
      });
      self.postMessage({ type: "result", id: msg.id, vectors: output.tolist() });
    }
  } catch (err) {
    self.postMessage({ type: "error", id: msg.id, message: String(err) });
  }
};
