# whatsoRAG

**A visual webapp that helps you figure out how you are going to ingest, extract, and RAG.**

Drag the pieces of a data pipeline onto a canvas, customize each step, tune it, see the effect on
the output, watch how it holds up as data grows over time, and export a complete plan. It is a
decision helper for designing real ingestion and retrieval pipelines, grounded in current
research - not a toy, and not a runtime.

Live demo: https://whatsorag.vercel.app

Made by Meagan McKeever.

<!-- Add a screenshot at docs/screenshot.png and uncomment:
![whatsoRAG pipeline visualizer](docs/screenshot.png)
-->

## What it does

You build a pipeline from labelled pieces (sources, identify, read, make searchable, resolve,
stores, retrieve, query, RAG type). As you build, whatsoRAG:

- **Recommends a retrieval architecture** for your configuration (plain hybrid RAG, GraphRAG,
  HippoRAG, RAPTOR, HypergraphRAG, vision-native / ColPali, or temporal-spatial), with the
  reasoning and an honest confidence label.
- **Reality-checks it:** does this need AI or can it run on rules, and will it actually work
  (it flags gaps like "you make fingerprints but have no store to keep them in").
- **Cooks it:** a mock run that shows what you end up with (your vector database, knowledge graph,
  hypergraph, timeline) and whether you can keep adding with **rolling ingestion** or would have
  to re-mix and rebake.
- **Shows tradeoffs:** mock tuning (chunk size, overlap, embedding size, rerank, chunk strategy)
  with live precision / recall / speed / cost / storage meters, plus a time slider that shows how
  outcomes flex as more sources arrive.
- **Explains everything in plain English,** with hover definitions for any non-business term.
- **Exports a complete `.md` spec / build prompt** you can keep as a plan or hand to an AI.

## How it works

The pipeline reads left to right as stages. Click "Arrange in stages" to lay any canvas out like
an architecture diagram.

```
Sources -> Identify -> Read -> Make searchable -> Resolve -> Stores -> Retrieve -> Query / RAG
 files      detect      parse     chunk            dedup      vector    translate    answer
 audio      scan        ocr       embed            entity     graph     route        rerank
 pdf        language    vision    index            canonical  hypergraph hops         cited
 ...        ...         ...       ...              ...        timeline   scoring      output
```

Everything is a pure function over the canvas. There is **no live API and no LLM call** - the
logic is hard-coded from extraction best practice, so it is a fast, free, fully local design
tool. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the design and the research behind it.

## Retrieval architectures it knows

RAG, GraphRAG, LightRAG, LazyGraphRAG, HippoRAG, RAPTOR, HypergraphRAG, ColPali (vision-native),
and HyperTSRAG (temporal-spatial, marked as a preprint). Open the **Compare architectures** panel
in the app for a side-by-side. Claims are labelled by source confidence; vendor and preprint
claims are marked as such, and refuted claims are excluded.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **React Flow** (`@xyflow/react`) for the node canvas
- **Zustand** for canvas state
- **Tailwind CSS v4**
- **Phosphor Icons**
- **Vercel** hosting + cookieless **Vercel Web Analytics**

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Other scripts:

```bash
npm run build   # production build
npm run lint    # eslint
npm run sim     # run the logic through sample configs and print the recommendations
```

## Project structure

```
src/
  app/                     routes: / (Main), /projects, /projects/pipeline-visualizer
  components/              canvas, palette, output panel, cook, compare, data-shape, templates
  lib/
    catalog.ts             the pieces ("what's possible") and model options
    analyze.ts             outcomes, benefits, tradeoff meters
    recommend.ts           retrieval-architecture recommendation
    reality.ts             needs-AI + feasibility check
    cook.ts                mock run + over-time health
    exportSpec.ts          build the .md spec / prompt
    glossary.ts            plain hover definitions
    explain.ts             per-piece what / when / vs
  store/canvas.ts          zustand store
scripts/sim.ts             simulation harness for the logic
docs/ARCHITECTURE.md       design + research notes
```

## Notes and limitations

- This is a **planning and explanation tool**, not a pipeline runtime. It does not run real
  extraction, embeddings, or retrieval.
- The tuning meters and the "cook" output are **illustrative (mock)** - they show tradeoffs, not
  benchmarked numbers.
- Architecture facts are drawn from 2025-2026 sources and labelled by confidence. See
  [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for citations.

## License

MIT - see [LICENSE](LICENSE).
