import type { Messages } from "@/i18n";

export type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  featured: boolean;
};

export function createPlaceholderPlans(placeholder: Messages["plans"]["placeholder"]): Plan[] {
  return [false, true, false].map((featured) => ({
    name: placeholder.name,
    price: placeholder.price,
    period: placeholder.period,
    description: placeholder.description,
    features: [placeholder.feature1, placeholder.feature2, placeholder.feature3],
    cta: placeholder.cta,
    featured,
  }));
}
