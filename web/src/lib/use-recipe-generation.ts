"use client";

import { useCallback, useRef, useState } from "react";
import { api, ApiError, extractRecipeFromStatus, isRecipeComplete } from "./api";
import type { Recipe } from "./types";

export type GenerationStatus =
  | "idle"
  | "starting"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

const POLL_INTERVAL_MS = 1800;
const MAX_POLL_MS = 4 * 60 * 1000;

export function useRecipeGeneration() {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [partial, setPartial] = useState<Recipe | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const cancelledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(0);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const reset = useCallback(() => {
    clearTimer();
    cancelledRef.current = false;
    setStatus("idle");
    setProgress(0);
    setPartial(null);
    setRecipe(null);
    setError(null);
    setRequestId(null);
  }, []);

  const poll = useCallback(async (id: string) => {
    if (cancelledRef.current) return;

    if (Date.now() - startedAtRef.current > MAX_POLL_MS) {
      setStatus("failed");
      setError("This is taking longer than expected. Please try again.");
      return;
    }

    try {
      const res = await api.getRecipeStatus(id);
      if (cancelledRef.current) return;

      if (isRecipeComplete(res)) {
        const final = extractRecipeFromStatus(res);
        setRecipe(final);
        setProgress(100);
        setStatus("completed");
        clearTimer();
        return;
      }

      if (res.status === "failed") {
        setStatus("failed");
        setError(res.message || "Recipe generation failed. Please try again.");
        clearTimer();
        return;
      }

      if (res.status === "cancelled") {
        setStatus("cancelled");
        clearTimer();
        return;
      }

      // still processing
      if (typeof res.progress === "number") setProgress(res.progress);
      if (res.partialRecipe) setPartial(res.partialRecipe);
      setStatus("processing");
      timerRef.current = setTimeout(() => void poll(id), POLL_INTERVAL_MS);
    } catch (err) {
      if (cancelledRef.current) return;
      // Transient errors (e.g. 404 right after enqueue, rate limits) — keep trying
      // until the max timeout, but surface hard failures.
      if (err instanceof ApiError && err.status === 429) {
        timerRef.current = setTimeout(() => void poll(id), POLL_INTERVAL_MS * 2);
        return;
      }
      if (err instanceof ApiError && (err.status === 404 || err.status === 0)) {
        timerRef.current = setTimeout(() => void poll(id), POLL_INTERVAL_MS);
        return;
      }
      setStatus("failed");
      setError(err instanceof Error ? err.message : "Something went wrong.");
      clearTimer();
    }
  }, []);

  const start = useCallback(
    async (query: string, save = false) => {
      clearTimer();
      cancelledRef.current = false;
      setStatus("starting");
      setProgress(0);
      setPartial(null);
      setRecipe(null);
      setError(null);
      startedAtRef.current = Date.now();

      try {
        const res = await api.generateRecipe(query, save);
        if (cancelledRef.current) return;
        setRequestId(res.requestId);
        setStatus("processing");
        timerRef.current = setTimeout(() => void poll(res.requestId), POLL_INTERVAL_MS);
      } catch (err) {
        setStatus("failed");
        setError(err instanceof Error ? err.message : "Failed to start generation.");
      }
    },
    [poll],
  );

  const cancel = useCallback(async () => {
    cancelledRef.current = true;
    clearTimer();
    setStatus("cancelled");
    if (requestId) {
      try {
        await api.cancelRecipe(requestId);
      } catch {
        // best effort
      }
    }
  }, [requestId]);

  return { status, progress, partial, recipe, error, requestId, start, cancel, reset };
}
