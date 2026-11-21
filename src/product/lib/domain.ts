export type Tier = "bronze" | "silver" | "gold" | "onyx";

export type MemberStatus = "active" | "expired" | "cancelled";

export type TierBenefits = {
  discountPercent: number;
  pointsPerTenPesos: number;
  cashbackPercent: number;
};

export type Member = {
  id: number;
  code: string;
  fullName: string;
  tier: Tier;
  tierName: string;
  status: MemberStatus;
  validUntil: string;
  points: number;
  cashbackBalanceCents: number;
  photoUrl: string | null;
  benefits: TierBenefits;
};

export type PurchaseBreakdown = {
  amountCents: number;
  discountCents: number;
  cashbackAppliedCents: number;
  totalCents: number;
  pointsEarned: number;
  cashbackEarnedCents: number;
};

export type Receipt = {
  id: string;
  memberName: string;
  concept: string;
  tierName: string;
  createdAt: string;
  discountPercent: number;
  pointsAfter: number;
  cashbackBalanceAfterCents: number;
  breakdown: PurchaseBreakdown;
};
