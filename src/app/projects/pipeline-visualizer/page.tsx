"use client";

import { useState } from "react";
import Link from "next/link";
import { Stack, Table, Shapes, CookingPot, X } from "@phosphor-icons/react";
import { Palette } from "@/components/Palette";
import { PipelineCanvas } from "@/components/PipelineCanvas";
import { OutputPanel } from "@/components/OutputPanel";
import { Templates } from "@/components/Templates";
import { ComparisonTable } from "@/components/ComparisonTable";
import { DataShape } from "@/components/DataShape";
import { Cook } from "@/components/Cook";

export default function PipelineVisualizer() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showShape, setShowShape] = useState(false);
  const [showCook, setShowCook] = useState(false);

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

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTemplates((v) => !v)}
              className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Stack size={15} weight="bold" /> Templates
            </button>
            {showTemplates && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowTemplates(false)} />
                <div className="absolute right-0 z-20 mt-1 w-[320px] rounded-lg border border-neutral-200 bg-white p-2 shadow-lg">
                  <Templates />
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowCook(true)}
            className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700"
          >
            <CookingPot size={15} weight="bold" /> Cook
          </button>

          <button
            type="button"
            onClick={() => setShowShape(true)}
            className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <Shapes size={15} weight="bold" /> Data shape
          </button>

          <button
            type="button"
            onClick={() => setShowCompare(true)}
            className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <Table size={15} weight="bold" /> Compare architectures
          </button>

          <span className="ml-2 text-xs text-neutral-400">Made by Meagan McKeever</span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <Palette />
        <div className="min-w-0 flex-1">
          <PipelineCanvas />
        </div>
        <OutputPanel />
      </div>

      {showCook && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-auto bg-black/40 p-6">
          <div className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Cook: what you end up with</h2>
              <button
                type="button"
                onClick={() => setShowCook(false)}
                className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100"
                aria-label="Close"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
            <Cook />
          </div>
        </div>
      )}

      {showShape && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-auto bg-black/40 p-6">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Shape of your data</h2>
              <button
                type="button"
                onClick={() => setShowShape(false)}
                className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100"
                aria-label="Close"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
            <DataShape />
          </div>
        </div>
      )}

      {showCompare && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-auto bg-black/40 p-6">
          <div className="w-full max-w-6xl rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Retrieval architectures, compared</h2>
              <button
                type="button"
                onClick={() => setShowCompare(false)}
                className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100"
                aria-label="Close"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
            <ComparisonTable />
          </div>
        </div>
      )}
    </div>
  );
}
