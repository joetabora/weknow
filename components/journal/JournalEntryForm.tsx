"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { createJournalEntryAction } from "@/app/actions/journal";
import type { JournalConfidence } from "@/types/market";

type JournalEntryFormProps = {
  marketId: string;
  kalshiYesProbability: number;
};

const CONFIDENCE_OPTIONS: JournalConfidence[] = ["Low", "Medium", "High"];

export function JournalEntryForm({
  marketId,
  kalshiYesProbability,
}: JournalEntryFormProps) {
  const router = useRouter();
  const [thesis, setThesis] = useState("");
  const [expectedProbability, setExpectedProbability] = useState("");
  const [confidenceLevel, setConfidenceLevel] =
    useState<JournalConfidence>("Medium");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const probability = Number(expectedProbability);
    if (!thesis.trim()) {
      setError("Thesis is required.");
      return;
    }
    if (
      Number.isNaN(probability) ||
      probability < 0 ||
      probability > 100
    ) {
      setError("Estimated probability must be between 0 and 100.");
      return;
    }

    startTransition(async () => {
      try {
        await createJournalEntryAction({
          marketId,
          thesis,
          confidenceLevel,
          expectedProbability: probability,
        });
        setThesis("");
        setExpectedProbability("");
        setConfidenceLevel("Medium");
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to save journal entry.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border border-slate-200 bg-white/70 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Kalshi
          </p>
          <p className="mt-1 font-mono text-lg text-slate-950">
            {kalshiYesProbability}%
          </p>
        </div>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-500">
            My estimated probability
          </span>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={expectedProbability}
            onChange={(event) => setExpectedProbability(event.target.value)}
            placeholder="70"
            className="mt-2 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
            required
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs uppercase tracking-[0.12em] text-slate-500">
          My Thesis — Why I think this
        </span>
        <textarea
          value={thesis}
          onChange={(event) => setThesis(event.target.value)}
          rows={4}
          placeholder="Inflation declining"
          className="mt-2 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
          required
        />
      </label>

      <label className="block max-w-xs">
        <span className="text-xs uppercase tracking-[0.12em] text-slate-500">
          Confidence
        </span>
        <select
          value={confidenceLevel}
          onChange={(event) =>
            setConfidenceLevel(event.target.value as JournalConfidence)
          }
          className="mt-2 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
        >
          {CONFIDENCE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center bg-cyan-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save journal entry"}
      </button>
    </form>
  );
}
