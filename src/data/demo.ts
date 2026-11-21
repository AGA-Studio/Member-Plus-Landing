import type { Tier } from "@/components/ui/MembershipCard";

export type DemoCustomer = {
  name: string;
  tier: Tier;
  code: string;
};

export type DemoTier = {
  tier: Tier;
  price: number;
  discount: number;
  pointsPerTen: number;
  cashback: number;
};

export type DemoBusinessKey = "volcan" | "fuerza" | "claro";

export type DemoBusiness = {
  key: DemoBusinessKey;
  initials: string;
  customers: DemoCustomer[];
  tiers: DemoTier[];
};

export const demoBusinesses: DemoBusiness[] = [
  {
    key: "volcan",
    initials: "CV",
    customers: [
      { name: "Mariana Soto", tier: "gold", code: "MP-K7Q4N" },
      { name: "Andrés Paredes", tier: "silver", code: "MP-T2H9X" },
      { name: "Lucía Montalvo", tier: "bronze", code: "MP-B5R8D" },
      { name: "Iván Cordero", tier: "silver", code: "MP-W4J6M" },
    ],
    tiers: [
      { tier: "bronze", price: 199, discount: 5, pointsPerTen: 1, cashback: 0 },
      { tier: "silver", price: 399, discount: 10, pointsPerTen: 1, cashback: 2 },
      { tier: "gold", price: 699, discount: 15, pointsPerTen: 1, cashback: 3 },
    ],
  },
  {
    key: "fuerza",
    initials: "EF",
    customers: [
      { name: "Renata Villaseñor", tier: "onyx", code: "MP-R3W8D" },
      { name: "Diego Almanza", tier: "gold", code: "MP-N6C2K" },
      { name: "Paola Quintero", tier: "silver", code: "MP-H9P4T" },
      { name: "Tomás Beltrán", tier: "silver", code: "MP-F7S3Q" },
    ],
    tiers: [
      { tier: "silver", price: 499, discount: 8, pointsPerTen: 1, cashback: 0 },
      { tier: "gold", price: 899, discount: 12, pointsPerTen: 2, cashback: 2 },
      { tier: "onyx", price: 1499, discount: 20, pointsPerTen: 3, cashback: 5 },
    ],
  },
  {
    key: "claro",
    initials: "OC",
    customers: [
      { name: "Camila Ibarra", tier: "gold", code: "MP-M8V5Z" },
      { name: "Héctor Salgado", tier: "bronze", code: "MP-D4G7L" },
      { name: "Valeria Núñez", tier: "onyx", code: "MP-S6X9A" },
      { name: "Rodrigo Escamilla", tier: "bronze", code: "MP-Y3K2E" },
    ],
    tiers: [
      { tier: "bronze", price: 299, discount: 10, pointsPerTen: 1, cashback: 0 },
      { tier: "gold", price: 799, discount: 15, pointsPerTen: 1, cashback: 3 },
      { tier: "onyx", price: 1299, discount: 25, pointsPerTen: 2, cashback: 4 },
    ],
  },
];

export const tierShowcase: Array<{ tier: Tier; member: string; code: string; business: string }> = [
  { tier: "bronze", member: "Lucía Montalvo", code: "MP-B5R8D", business: "Café Volcán" },
  { tier: "silver", member: "Paola Quintero", code: "MP-H9P4T", business: "Estudio Fuerza" },
  { tier: "gold", member: "Camila Ibarra", code: "MP-M8V5Z", business: "Óptica Claro" },
  { tier: "onyx", member: "Renata Villaseñor", code: "MP-R3W8D", business: "Estudio Fuerza" },
];
