"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type PixCopyButtonProps = {
  pixKey: string;
};

export function PixCopyButton({ pixKey }: PixCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(pixKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button
        aria-label={copied ? "Chave Pix copiada" : "Copiar chave Pix"}
        className="w-fit border-emerald-300/25 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/15"
        onClick={handleCopy}
        size="sm"
        type="button"
        variant="outline"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Chave Pix copiada" : "Copiar chave Pix"}
      </Button>
      <span className="text-xs text-emerald-100/75" aria-live="polite">
        {copied ? "Pronto, chave disponível na área de transferência." : ""}
      </span>
    </div>
  );
}
