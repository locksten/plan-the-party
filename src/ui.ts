import type { CategoryId, FoodLeftoverChoice, LongLastingFoodLeftoverChoice, PlanProblem } from "./domain/model";

export type StandardFoodLeftoverChoice = "suvalgyti" | "ismesti";
export type { FoodLeftoverChoice, LongLastingFoodLeftoverChoice };

export const CATEGORIES: ReadonlyArray<{ id: CategoryId; label: string }> = [
  { id: "papildomai", label: "Papuošimai" },
  { id: "gerimai", label: "Gėrimai" },
  { id: "uzkandziai", label: "Užkandžiai" },
  { id: "veikla", label: "Bendra veikla" },
];

export const FOOD_LEFTOVER_CHOICES: ReadonlyArray<{ id: StandardFoodLeftoverChoice; label: string }> = [
  { id: "suvalgyti", label: "Pabaigti viską" },
  { id: "ismesti", label: "Išmesti" },
];

export const LONG_LASTING_FOOD_LEFTOVER_CHOICES: ReadonlyArray<{ id: LongLastingFoodLeftoverChoice; label: string }> = [
  ...FOOD_LEFTOVER_CHOICES,
  { id: "pasilikti-kitai-sventei", label: "Pasilikti kitai šventei" },
];

export const COMPOST_FOOD_LEFTOVER_CHOICE = { id: "kompostuoti", label: "Kompostuoti" } as const;

export const formatEuros = (value: number) => `${value} €`;

export function formatPlanProblem(problem: PlanProblem): string {
  switch (problem.kind) {
    case "overBudget": return `Biudžetą viršijote ${problem.amount} €.`;
    case "missingDrinks": return `Gėrimų trūksta ${problem.amount} žmonėms.`;
    case "missingSnacks": return `Užkandžių trūksta ${problem.amount} žmonėms.`;
    case "missingDrinkVariety": return `Pasirinkite bent ${problem.amount} skirtingus gėrimus.`;
    case "missingSnackVariety": return `Pasirinkite bent ${problem.amount} skirtingus užkandžius.`;
    case "missingActivities": return problem.amount === 1
      ? "Pasirinkite bent vieną bendrą veiklą."
      : `Pasirinkite bent ${problem.amount} skirtingas bendras veiklas.`;
    case "missingDecorations": return `Pasirinkite bent ${problem.amount} papuošimus.`;
  }
}

export function classes(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
