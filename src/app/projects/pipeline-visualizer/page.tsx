"use client";

import Link from "next/link";
import { Palette } from "@/components/Palette";
import { PipelineCanvas } from "@/components/PipelineCanvas";
import { OutputPanel } from "@/components/OutputPanel";

export default function PipelineVisualizer() {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2">
        <nav className="text-sm text-neutral-500">
          <Link href="/" className="hover:underline">Main</Link>
          <span className="px-1">/</span>
          <Link href="/projects" className="hover:underline">Projects</Link>
          <span className="px-1">/</span>
          <span className="font-medium text-neutral-800">Pipeline Visualizer</span>
        </nav>
        <div className="text-xs text-neutral-400">Made by Meagan McKeever</div>
      </header>
      <div className="flex min-h-0 flex-1">
        <Palette />
        <div className="min-w-0 flex-1">
          <PipelineCanvas />
        </div>
        <OutputPanel />
      </div>
    </div>
  );
}
