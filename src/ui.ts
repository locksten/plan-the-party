import type { CategoryId, ModeId } from "./game";

export type LeftoverChoice = "taupyti" | "klases-tikslui" | "paramai";

export const CATEGORIES: ReadonlyArray<{ id: CategoryId; label: string }> = [
  { id: "papildomai", label: "Papuošimai" },
  { id: "gerimai", label: "Gėrimai" },
  { id: "uzkandziai", label: "Užkandžiai" },
  { id: "veikla", label: "Bendra veikla" },
];

export const MODE_VISUALS: Record<ModeId, { number: string; callout: string; frameColor: string }> = {
  paprasta: { number: "1", callout: "Rinkis", frameColor: "bg-yellow" },
  iprasta: { number: "2", callout: "Skaičiuok", frameColor: "bg-blue" },
  issukis: { number: "3", callout: "Reaguok", frameColor: "bg-coral" },
};

export const CATEGORY_ACCENT: Record<CategoryId, string> = {
  gerimai: "bg-aqua",
  uzkandziai: "bg-orange-soft",
  veikla: "bg-purple-soft",
  papildomai: "bg-blue-soft",
};

export const LEFTOVER_CHOICES: ReadonlyArray<{ id: LeftoverChoice; label: string }> = [
  { id: "taupyti", label: "Taupyti kitai veiklai" },
  { id: "klases-tikslui", label: "Skirti bendram klasės tikslui" },
  { id: "paramai", label: "Skirti paramai" },
];

export const formatEuros = (value: number) => `${value} €`;

export function classes(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
