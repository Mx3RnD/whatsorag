// End-to-end test: feed synthetic pipeline configs through the FULL logic chain
// (analyze -> recommend -> reality -> cook -> export markdown) and assert the
// outputs are correct and complete. Writes a real sample export to docs/.
// Run: npx tsx scripts/e2e.ts   (also: npm test)
import assert from "node:assert";
import { writeFileSync } from "node:fs";
import { getPiece } from "@/lib/catalog";
import { analyze } from "@/lib/analyze";
import { recommend } from "@/lib/recommend";
import { realityCheck } from "@/lib/reality";
import { cook } from "@/lib/cook";
import { buildSpecMarkdown } from "@/lib/exportSpec";
import type { Tuning } from "@/store/canvas";

const T: Tuning = { chunkSize: 600, overlap: 12, embedDims: 1536, rerank: true, chunkStrategy: "contextual", growth: 0 };

function nodes(ids: string[]) {
  return ids.map((id, i) => {
    const p = getPiece(id);
    assert.ok(p, `piece ${id} must exist in catalog`);
    return { id: `n${i}`, position: { x: i * 200, y: 0 }, data: { pieceId: id, label: p!.label, category: p!.category, color: "#000" } };
  }) as any;
}
function edges(ns: any[]) {
  return ns.slice(1).map((n, i) => ({ id: `e${i}`, source: ns[i].id, target: n.id })) as any;
}

let passed = 0;
const check = (name: string, fn: () => void) => {
  try { fn(); passed++; console.log("  PASS", name); }
  catch (e) { console.error("  FAIL", name, "\n   ", (e as Error).message); process.exitCode = 1; }
};

// ---- Config 1: Formula database (graph) -----------------------------------
const formulaIds = ["src-pdf", "rd-extract-table", "rs-entity", "rs-relationship", "rs-canonical", "st-relational", "st-graph", "qo-answer"];
const formula = nodes(formulaIds);
const formulaEdges = edges(formula);

console.log("\n[Formula database]");
check("recommends a graph architecture", () => {
  assert.match(recommend(formula).architecture, /GraphRAG|HippoRAG/);
});
check("reality is workable", () => {
  assert.strictEqual(realityCheck(formula, formulaEdges).verdict, "workable");
});
check("cook produces stores", () => {
  const c = cook(formula, formulaEdges, T);
  assert.ok(c.hasStore && c.stores.length >= 1, "should have at least one store drawn");
  assert.strictEqual(c.overTime.length, 3, "over-time has 3 snapshots");
});
check("export markdown is complete", () => {
  const md = buildSpecMarkdown("Formula database", formula, formulaEdges, T);
  for (const must of ["# Formula database", "## What this pipeline does", "## The pieces", "Extract table", "## Tuning", "Chunk size: 600", "## What you get", "## Prompt to build this"]) {
    assert.ok(md.includes(must), `export must contain: ${must}`);
  }
  // emit the real artifact so we can see it works
  writeFileSync(new URL("../docs/example-export.md", import.meta.url), md);
});

// ---- Config 2: Plain text RAG --------------------------------------------
const plain = nodes(["src-file", "rd-parse", "se-chunk", "se-embed", "st-vector", "qo-query"]);
console.log("\n[Plain text RAG]");
check("recommends hybrid RAG", () => assert.match(recommend(plain).architecture, /Hybrid RAG/));
check("reality workable + needs AI", () => {
  const r = realityCheck(plain, edges(plain));
  assert.strictEqual(r.verdict, "workable");
  assert.strictEqual(r.needsAI, true);
});

// ---- Config 3: Hypergraph ------------------------------------------------
const hyper = nodes(["src-pdf", "rs-entity", "st-hypergraph", "rag-hyper", "rt-route", "rt-hops", "rt-rerank", "qo-answer"]);
console.log("\n[Hypergraph]");
check("recommends HypergraphRAG", () => assert.match(recommend(hyper).architecture, /HypergraphRAG/));

// ---- Config 4: Broken (embed, no store) ----------------------------------
const broken = nodes(["src-file", "se-embed"]);
console.log("\n[Broken: embed, no store]");
check("reality flags the gap", () => {
  const r = realityCheck(broken, edges(broken));
  assert.strictEqual(r.verdict, "gaps");
  assert.ok(r.issues.some((i) => /store/i.test(i)), "should flag the missing store");
});

// ---- Config 5: Empty -----------------------------------------------------
console.log("\n[Empty]");
check("empty canvas is handled", () => {
  assert.strictEqual(realityCheck([], []).verdict, "empty");
  assert.strictEqual(cook([], [], T).hasStore, false);
});

console.log(`\n${passed} checks passed${process.exitCode ? " (with failures)" : ", all green"}.`);
