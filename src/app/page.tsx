import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
      <div className="text-[13px] font-semibold uppercase tracking-widest text-[#7B4FB3]">whatsoRAG</div>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900">
        Figure out how you will ingest, extract, and RAG.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-neutral-600">
        A visual resource for designing a real ingestion and retrieval pipeline. Drag the pieces,
        customize, tune, see the effect on the output, and export a complete plan.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/projects"
          className="rounded-lg bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Open Projects
        </Link>
        <Link href="/projects/pipeline-visualizer" className="text-sm font-medium text-neutral-700 underline">
          Go straight to the Pipeline Visualizer
        </Link>
      </div>
      <div className="mt-16 text-xs text-neutral-400">Made by Meagan McKeever</div>
    </main>
  );
}
