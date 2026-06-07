"use client";

import { useState } from "react";
import Link from "next/link";
import { PaperPlaneTilt, CheckCircle } from "@phosphor-icons/react";
import { getSupabase } from "@/lib/supabase";

// A small feedback box: name (optional) + comment + submit. Stores to Supabase.
export function Feedback({ showViewAll = true }: { showViewAll?: boolean }) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const supabase = getSupabase();

  async function submit() {
    if (!body.trim()) return;
    if (!supabase) {
      setState("error");
      setError("Comments are not configured right now.");
      return;
    }
    setState("sending");
    const { error } = await supabase
      .from("comments")
      .insert({ name: name.trim() || null, body: body.trim() });
    if (error) {
      setState("error");
      setError(error.message);
      return;
    }
    setState("done");
    setName("");
    setBody("");
  }

  if (state === "done") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <div className="flex items-center gap-1.5 font-medium">
          <CheckCircle size={16} weight="bold" /> Thanks, your comment is in.
        </div>
        <button onClick={() => setState("idle")} className="mt-2 text-xs underline">
          Leave another
        </button>
        {showViewAll && (
          <Link href="/comments" className="mt-2 ml-3 text-xs underline">
            View all comments
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name (optional)"
        className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What did you think? What is missing? What broke?"
        rows={4}
        maxLength={2000}
        className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
      />
      {state === "error" && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={!body.trim() || state === "sending"}
          className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          <PaperPlaneTilt size={15} weight="bold" />
          {state === "sending" ? "Sending" : "Submit comment"}
        </button>
        {showViewAll && (
          <Link href="/comments" className="text-xs text-neutral-500 underline">
            View all comments
          </Link>
        )}
      </div>
    </div>
  );
}
