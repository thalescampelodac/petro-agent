"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const STORAGE_KEY = "petroagent-like-count";
const INITIAL_COUNT = 128;

export function LikeButton() {
  const [count, setCount] = useState(INITIAL_COUNT);
  const [isPopping, setIsPopping] = useState(false);
  const [message, setMessage] = useState("Mostre que voce esta acompanhando");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCount(Number(window.localStorage.getItem(STORAGE_KEY) ?? INITIAL_COUNT));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function handleClick() {
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
    window.setTimeout(() => setIsPopping(false), 420);
  }

  return (
    <div className="rounded-lg border border-emerald-300/20 bg-white/[0.04] p-3 shadow-2xl shadow-emerald-950/30 backdrop-blur">
      <button
        aria-label="Gostei do projeto"
        className={cn(
          "group flex w-full items-center justify-between gap-3 rounded-md border border-emerald-300/25 bg-emerald-300 px-4 py-3 text-sm font-semibold text-emerald-950 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200",
          isPopping && "scale-[1.03]",
        )}
        type="button"
        onClick={handleClick}
      >
        <span className="flex items-center gap-2">
          <Heart
            className={cn(
              "size-4 fill-emerald-950 transition-transform duration-300 group-hover:scale-110",
              isPopping && "rotate-[-10deg] scale-125",
            )}
          />
          Gostei do projeto
        </span>
        <span className="rounded bg-emerald-950/10 px-2 py-1 font-mono text-xs">
          {count.toLocaleString("pt-BR")}
        </span>
      </button>
      <p aria-live="polite" className="mt-2 text-xs text-emerald-100/70">
        {message}
      </p>
    </div>
  );
}
