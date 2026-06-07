import Link from "next/link";

export default function Projects() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <nav className="mb-8 text-sm text-neutral-500">
        <Link href="/" className="hover:underline">Main</Link> <span className="px-1">/</span> Projects
      </nav>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Projects</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/projects/pipeline-visualizer"
          className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 hover:shadow-sm"
        >
          <div className="text-[12px] font-semibold uppercase tracking-wide text-[#7B4FB3]">Tool</div>
          <div className="mt-1 text-lg font-semibold text-neutral-900">Pipeline Visualizer</div>
          <p className="mt-1 text-sm text-neutral-600">
            Drag pieces to design an ingest / extract / RAG pipeline. Tune it, see the effect, export a plan.
          </p>
        </Link>
      </div>
      <div className="mt-16 text-xs text-neutral-400">Made by Meagan McKeever</div>
    </main>
  );
}
