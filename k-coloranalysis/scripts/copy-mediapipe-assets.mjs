import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(projectRoot, "node_modules", "@mediapipe", "tasks-vision", "wasm");
const destination = join(projectRoot, "public", "mediapipe");

mkdirSync(destination, { recursive: true });
for (const name of [
  "vision_wasm_internal.js",
  "vision_wasm_internal.wasm",
  "vision_wasm_nosimd_internal.js",
  "vision_wasm_nosimd_internal.wasm",
]) {
  copyFileSync(join(source, name), join(destination, name));
}

// The runtime sends this successful CPU initialization notice to stderr.
// Next's development overlay treats it as an application error.
for (const name of ["vision_wasm_internal.js", "vision_wasm_nosimd_internal.js"]) {
  const path = join(destination, name);
  const original = readFileSync(path, "utf8");
  const loggingLine = "var err = console.error.bind(console);";
  if (!original.includes(loggingLine)) {
    throw new Error(`MediaPipe logging hook changed in ${name}`);
  }
  writeFileSync(path, original.replace(
    loggingLine,
    'var err = (message) => { if (message !== "INFO: Created TensorFlow Lite XNNPACK delegate for CPU.") console.error(message); };',
  ));
}
