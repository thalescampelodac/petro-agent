import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("combina classes condicionais", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolve conflitos de Tailwind mantendo a classe mais recente", () => {
    expect(cn("px-2 text-sm", "px-4")).toBe("text-sm px-4");
  });
});
