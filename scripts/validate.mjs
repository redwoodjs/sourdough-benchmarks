import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const files = [
  ...(await jsonFiles(path.join(root, "pulls"))),
  ...(await jsonFiles(path.join(root, "main"))),
];

for (const file of files) {
  const result = JSON.parse(await readFile(file, "utf8"));
  assert(result.schemaVersion === 1, file, "schemaVersion must be 1");
  assert(result.source?.repository === "redwoodjs/sourdough", file, "unexpected source repository");
  assert(/^[a-f0-9]{40}$/.test(result.source?.baseSha), file, "invalid base SHA");
  assert(/^[a-f0-9]{40}$/.test(result.source?.headSha), file, "invalid head SHA");
  assert(typeof result.source?.runId === "string", file, "missing run ID");
  assert(typeof result.summary?.passed === "boolean", file, "missing pass status");
  assert(result.benchmarks && typeof result.benchmarks === "object", file, "missing benchmarks");

  for (const [name, benchmark] of Object.entries(result.benchmarks)) {
    assert(name.length > 0, file, "empty benchmark name");
    assert(
      ["passed", "warning", "regression", "added", "removed"].includes(benchmark.status),
      file,
      `invalid status for ${name}`,
    );
  }
}

console.log(`Validated ${files.length} benchmark result file(s).`);

async function jsonFiles(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(entry => {
        const target = path.join(directory, entry.name);
        return entry.isDirectory()
          ? jsonFiles(target)
          : entry.name.endsWith(".json")
            ? [target]
            : [];
      }),
    );
    return nested.flat();
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

function assert(condition, file, message) {
  if (!condition) {
    throw new Error(`${path.relative(root, file)}: ${message}`);
  }
}
