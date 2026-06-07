"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase, type Comment } from "@/lib/supabase";
import { Feedback } from "@/components/Feedback";

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoaded(true);
      return;
    }
    supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => {
        setComments((data as Comment[]) ?? []);
        setLoaded(true);
      });
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/" className="hover:underline">Main</Link>
        <span className="px-1">/</span>
        <span className="font-medium text-neutral-800">Comments</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Comments</h1>
      <p className="mt-1 text-sm text-neutral-600">Tell me what you think of whatsoRAG.</p>

      <div className="mt-5 rounded-xl border border-neutral-200 bg-white p-4">
        <Feedback showViewAll={false} />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {!loaded && <p className="text-sm text-neutral-400">Loading...</p>}
        {loaded && comments.length === 0 && (
          <p className="text-sm text-neutral-400">No comments yet. Be the first.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-neutral-800">{c.name || "Anonymous"}</span>
              <span className="text-[11px] text-neutral-400">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-xs text-neutral-400">Made by Meagan McKeever</div>
    </main>
  );
}
