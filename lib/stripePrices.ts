export type Plan = "silver" | "gold";
export type Frequency = "monthly" | "6months" | "annual";

export const PRICE_MAP: Record<Plan, Record<Frequency, string>> = {
  silver: {
    monthly: "price_1U4AEdEqzeZZAr9kMxuEopSX",
    "6months": "price_1U4AG5EqzeZZAr9kvwRzIYqd",
    annual: "price_1U4AGdEqzeZZAr9k6tUMetHP",
  },
  gold: {
    monthly: "price_1U4AHZEqzeZZAr9ks4Xj8QOd",
    "6months": "price_1U4AIEEqzeZZAr9kAGz6MaGb",
    annual: "price_1U5ApbEqzeZZAr9koGOV6E9y",
  },
};

// Reverse lookup derived from PRICE_MAP at module load — never hand-maintained.
export const PRICE_ID_TO_PLAN: Record<string, { plan: Plan; frequency: Frequency }> =
  Object.fromEntries(
    (Object.entries(PRICE_MAP) as [Plan, Record<Frequency, string>][]).flatMap(
      ([plan, frequencies]) =>
        (Object.entries(frequencies) as [Frequency, string][]).map(
          ([frequency, priceId]) => [priceId, { plan, frequency }] as const
        )
    )
  );
