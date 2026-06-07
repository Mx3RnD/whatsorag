# Formula database

> Built with whatsoRAG - a webapp that helps you figure out how you are going to ingest, extract, and RAG.
> This is a plan/prompt, not code.

## What this pipeline does

Everything is brought together into one place to query.

## The pieces (in order)

### Sources
- **PDF**: Born-digital or scanned.

### Read
- **Extract table**: Keep tables as tables (markdown).

### Resolve
- **Entity**: Pull out the things that matter.
- **Relationship**: Link entities together.
- **Canonical**: Pick one primary name (aka the rest).

### Stores
- **Relational database**: Rows and columns. postgres / sql.
- **Graph database**: A network of things and the two-way links between them (e.g. neo4j).

### Query and output
- **Output answer**: Answer a question with its source trail: where did this come from.

## How they connect

- PDF → Extract table
- Extract table → Entity
- Entity → Relationship
- Relationship → Canonical
- Canonical → Relational database
- Relational database → Graph database
- Graph database → Output answer

## Tuning

- Chunk size: 600 tokens
- Overlap: 12%
- Chunk strategy: contextual
- Embed size (fingerprint dims): 1536
- Rerank: on

## What you get

- Relational database (postgres): tidy rows your apps and dashboards read.
- A way to query it and show the result (dashboard, list, render).

## Benefits

- Tables stay tables, so numbers do not get scrambled.
- Rerank filters out 'looks similar but wrong' results.
- Contextual chunking keeps each passage's context, so retrieval misses less.

## Illustrative tradeoffs (mock)

- Precision: 93/100 — How on-target the hits are.
- Recall: 83/100 — How much relevant stuff it finds.
- Speed: 40/100 — How fast a query feels.
- Cost: 85/100 — Relative spend to run it.
- Storage: 85/100 — How much space it takes.

## Prompt to build this

You are building the pipeline described above. Implement it end to end:

1. Ingest the listed sources; identify each file by content (not extension) and route to its track.
2. Read/parse each track as specified (keep tables as tables).
3. Chunk and embed with the tuning above; index for search.
4. Resolve entities (dedup, normalize, canonical/aka) and build the listed store(s).
5. Wire the RAG type and the query/output surface.
6. Preserve a source trail (provenance) on every fact for citations.

State your model choices (open-weight vs frontier) and where each runs.
