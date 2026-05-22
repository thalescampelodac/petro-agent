"use client";

import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const STORAGE_KEY = "petroagent-like-count";
const RATE_LIMIT_KEY = "petroagent-like-activity";
const API_ENDPOINT = "/api/project-likes";
const INITIAL_COUNT = 128;
const RATE_LIMIT_WINDOW_MS = 10_000;
const MAX_LIKES_PER_WINDOW = 5;

function getRecentLikeActivity(now: number) {
  try {
    const activity = JSON.parse(
      window.localStorage.getItem(RATE_LIMIT_KEY) ?? "[]",
    ) as number[];

    return activity.filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
    );
  } catch {
    return [];
  }
}

async function fetchGlobalLikeCount() {
  try {
    const response = await fetch(API_ENDPOINT, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { count: number | null };
    return data.count;
  } catch {
    return null;
  }
}

async function registerGlobalLike() {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { count: number | null };
    return data.count;
  } catch {
    return null;
  }
}

export function LikeButton() {
  const [count, setCount] = useState(INITIAL_COUNT);
  const [isPopping, setIsPopping] = useState(false);
  const [message, setMessage] = useState("Mostre que você está acompanhando");
  const hasInteracted = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCount(Number(window.localStorage.getItem(STORAGE_KEY) ?? INITIAL_COUNT));
    });

    void fetchGlobalLikeCount().then((globalCount) => {
      if (typeof globalCount === "number" && !hasInteracted.current) {
        setCount(globalCount);
        window.localStorage.setItem(STORAGE_KEY, String(globalCount));
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function handleClick() {
    hasInteracted.current = true;
    const now = Date.now();
    const recentActivity = getRecentLikeActivity(now);

    if (recentActivity.length >= MAX_LIKES_PER_WINDOW) {
      setMessage("Pausa rapidinha: o apoio já foi registrado por aqui.");
      return;
    }

    const nextCount = count + 1;
    setCount(nextCount);
    setIsPopping(true);
    setMessage(
      [
        "Valeu pelo apoio!",
        "Mais um curioso acompanhando PETR4.",
        "O radar ganhou mais energia.",
        "Obrigado por fortalecer o projeto.",
      ][nextCount % 4],
    );
    window.localStorage.setItem(STORAGE_KEY, String(nextCount));
    window.localStorage.setItem(
      RATE_LIMIT_KEY,
      JSON.stringify([...recentActivity, now]),
    );
    window.setTimeout(() => setIsPopping(false), 420);

    const globalCount = await registerGlobalLike();

    if (typeof globalCount === "number") {
      setCount(globalCount);
      window.localStorage.setItem(STORAGE_KEY, String(globalCount));
    }
  }

  return (
    <div className="flex max-w-[13rem] flex-col items-end gap-2 text-right sm:max-w-none">
      <button
        aria-label="Gostei do projeto"
        className={cn(
          "group flex items-center justify-between gap-3 rounded-md border border-emerald-300/25 bg-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-lg shadow-emerald-950/20 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 sm:px-4 sm:text-sm",
          isPopping && "scale-[1.03]",
        )}
        type="button"
        onClick={handleClick}
      >
        <span className="flex items-center gap-2">
          <Heart
            className={cn(
              "size-3.5 fill-emerald-950 transition-transform duration-300 group-hover:scale-110 sm:size-4",
              isPopping && "rotate-[-10deg] scale-125",
            )}
          />
          Gostei do projeto
        </span>
        <span className="rounded bg-emerald-950/10 px-2 py-1 font-mono text-xs">
          {count.toLocaleString("pt-BR")}
        </span>
      </button>
      <p
        aria-live="polite"
        className="max-w-[12rem] text-xs leading-5 text-emerald-100/80 sm:max-w-none"
      >
        {message}
      </p>
    </div>
  );
}
