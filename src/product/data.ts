import type { Member, Receipt } from "./lib/domain";

export type ProductCopy = {
  tierName: string;
};

export function createMember(tierName: string): Member {
  return {
    id: 1,
    code: "MP-K7Q4N",
    fullName: "Mariana Soto",
    tier: "gold",
    tierName,
    status: "active",
    validUntil: "2027-03-14T10:00:00Z",
    points: 485,
    cashbackBalanceCents: 2550,
    photoUrl: null,
    benefits: { discountPercent: 15, pointsPerTenPesos: 1, cashbackPercent: 3 },
  };
}

export function createReceipt(tierName: string, concept: string): Receipt {
  return {
    id: "1",
    memberName: "Mariana Soto",
    concept,
    tierName,
    createdAt: "2026-11-18T16:20:00Z",
    discountPercent: 15,
    pointsAfter: 570,
    cashbackBalanceAfterCents: 5100,
    breakdown: {
      amountCents: 100000,
      discountCents: 15000,
      cashbackAppliedCents: 0,
      totalCents: 85000,
      pointsEarned: 85,
      cashbackEarnedCents: 2550,
    },
  };
}
