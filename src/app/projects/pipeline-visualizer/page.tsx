"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Stack,
  Table,
  Shapes,
  CookingPot,
  ChatText,
  X,
  House,
  SquaresFour,
  ChartBar,
  DotsThree,
} from "@phosphor-icons/react";
import { Palette } from "@/components/Palette";
import { PipelineCanvas } from "@/components/PipelineCanvas";
import { OutputPanel } from "@/components/OutputPanel";
import { Templates } from "@/components/Templates";
import { ComparisonTable } from "@/components/ComparisonTable";
import { DataShape } from "@/components/DataShape";
import { Cook } from "@/components/Cook";
import { Feedback } from "@/components/Feedback";

export default function PipelineVisualizer() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showShape, setShowShape] = useState(false);
  const [showCook, setShowCook] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  // Mobile-only: which secondary tools menu / side drawer is open.
  const [showTools, setShowTools] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"palette" | "output" | null>(null);

  const openTool = (open: () => void) => {
    setShowTools(false);
    open();
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-2 border-b border-neutral-200 bg-white px-3 py-2 sm:px-4">
        {/* Breadcrumb — desktop */}
        <nav className="hidden text-sm text-neutral-500 md:block">
          <Link href="/" className="hover:underline">Main</Link>
          <span className="px-1">/</span>
          <Link href="/projects" className="hover:underline">Projects</Link>
          <span className="px-1">/</span>
          <span className="font-medium text-neutral-800">Pipeline Visualizer</span>
        </nav>

        {/* Mobile left: home + Pieces drawer toggle */}
        <div className="flex items-center gap-1.5 md:hidden">
          <Link
            href="/projects"
            aria-label="Back to projects"
            className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100"
          >
            <House size={18} weight="bold" />
          </Link>
          <button
            type="button"
            onClick={() => setMobilePanel((p) => (p === "palette" ? null : "palette"))}
            aria-pressed={mobilePanel === "palette"}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium ${
              mobilePanel === "palette"
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            <SquaresFour size={15} weight="bold" /> Pieces
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Desktop actions */}
          <div className="relative hidden md:block">
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
                <div className="absolute right-0 z-20 mt-1 w-[min(320px,calc(100vw-2rem))] rounded-lg border border-neutral-200 bg-white p-2 shadow-lg">
                  <Templates />
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowCook(true)}
            className="hidden items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700 md:flex"
          >
            <CookingPot size={15} weight="bold" /> Cook
          </button>

          <button
            type="button"
            onClick={() => setShowShape(true)}
            className="hidden items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 md:flex"
          >
            <Shapes size={15} weight="bold" /> Data shape
          </button>

          <button
            type="button"
            onClick={() => setShowCompare(true)}
            className="hidden items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 md:flex"
          >
            <Table size={15} weight="bold" /> Compare architectures
          </button>

          <button
            type="button"
            onClick={() => setShowFeedback(true)}
            className="hidden items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 md:flex"
          >
            <ChatText size={15} weight="bold" /> Feedback
          </button>

          <span className="ml-2 hidden text-xs text-neutral-400 lg:inline">Made by Meagan McKeever</span>

          {/* Mobile actions: Tools menu + Results drawer toggle */}
          <div className="relative md:hidden">
            <button
              type="button"
              onClick={() => setShowTools((v) => !v)}
              aria-label="Tools"
              aria-expanded={showTools}
              className="flex items-center gap-1 rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <DotsThree size={18} weight="bold" /> Tools
            </button>
            {showTools && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowTools(false)} />
                <div className="absolute right-0 z-20 mt-1 w-52 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg">
                  <button type="button" onClick={() => openTool(() => setShowTemplates(true))} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100">
                    <Stack size={16} weight="bold" /> Templates
                  </button>
                  <button type="button" onClick={() => openTool(() => setShowCook(true))} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100">
                    <CookingPot size={16} weight="bold" /> Cook
                  </button>
                  <button type="button" onClick={() => openTool(() => setShowShape(true))} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100">
                    <Shapes size={16} weight="bold" /> Data shape
                  </button>
                  <button type="button" onClick={() => openTool(() => setShowCompare(true))} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100">
                    <Table size={16} weight="bold" /> Compare architectures
                  </button>
                  <button type="button" onClick={() => openTool(() => setShowFeedback(true))} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100">
                    <ChatText size={16} weight="bold" /> Feedback
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobilePanel((p) => (p === "output" ? null : "output"))}
            aria-pressed={mobilePanel === "output"}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium md:hidden ${
              mobilePanel === "output"
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            <ChartBar size={15} weight="bold" /> Results
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <Palette mobileOpen={mobilePanel === "palette"} onClose={() => setMobilePanel(null)} />
        <div className="min-w-0 flex-1">
          <PipelineCanvas />
        </div>
        <OutputPanel mobileOpen={mobilePanel === "output"} onClose={() => setMobilePanel(null)} />

        {/* Mobile backdrop behind the open drawer */}
        {mobilePanel && (
          <div
            className="absolute inset-0 z-20 bg-black/40 md:hidden"
            onClick={() => setMobilePanel(null)}
            aria-hidden
          />
        )}
      </div>

      {/* Templates as a modal on mobile (popover on desktop, above) */}
      {showTemplates && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-auto bg-black/40 p-3 md:hidden">
          <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Templates</h2>
              <button
                type="button"
                onClick={() => setShowTemplates(false)}
                className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100"
                aria-label="Close"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
            <Templates onPick={() => setShowTemplates(false)} />
          </div>
        </div>
      )}

      {showFeedback && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-auto bg-black/40 p-3 sm:p-6">
          <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Leave a comment</h2>
              <button
                type="button"
                onClick={() => setShowFeedback(false)}
                className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100"
                aria-label="Close"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
            <Feedback />
          </div>
        </div>
      )}

      {showCook && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-auto bg-black/40 p-3 sm:p-6">
          <div className="w-full max-w-3xl rounded-xl bg-white p-4 shadow-2xl sm:p-5">
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
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-auto bg-black/40 p-3 sm:p-6">
          <div className="w-full max-w-2xl rounded-xl bg-white p-4 shadow-2xl sm:p-5">
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
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-auto bg-black/40 p-3 sm:p-6">
          <div className="w-full max-w-6xl rounded-xl bg-white p-4 shadow-2xl sm:p-5">
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
