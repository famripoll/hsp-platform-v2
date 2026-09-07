export const PLAN_LIMITS: Record<string, number> = { silver: 5, gold: 20 };

// Returns midnight UTC of the current billing-cycle start, anchored to the
// day-of-month the subscription was created on.
export function computeCycleStart(subscriptionCreatedAt: string): Date {
  const created = new Date(subscriptionCreatedAt);
  const anchorDay = created.getUTCDate();

  const now = new Date();
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth();

  if (now.getUTCDate() < anchorDay) {
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
  }

  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(anchorDay, daysInMonth);

  return new Date(Date.UTC(year, month, day));
}
