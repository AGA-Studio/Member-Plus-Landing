import { createServer } from "node:http";

const port = Number(process.env.MOCK_API_PORT ?? 8000);

const copy = {
  es: { tiers: ["Bronce", "Plata", "Oro", "Onyx"], concept: "Consumo", cashier: "Ana Torres", admin: "Rafael Medina" },
  en: { tiers: ["Bronze", "Silver", "Gold", "Onyx"], concept: "Purchase", cashier: "Ana Torres", admin: "Rafael Medina" },
};

const businesses = {
  volcan: { id: 1, name: "Café Volcán", primary_color: null, primary_foreground: null },
  fuerza: { id: 2, name: "Estudio Fuerza", primary_color: "#d92d20", primary_foreground: "#ffffff" },
  claro: { id: 3, name: "Óptica Claro", primary_color: "#15803d", primary_foreground: "#ffffff" },
};

const finishes = ["bronze", "silver", "gold", "onyx"];
const tierRows = [
  { price_cents: 19900, discount_percent: 5, points_per_ten: 1, cashback_percent: 0 },
  { price_cents: 39900, discount_percent: 10, points_per_ten: 1, cashback_percent: 2 },
  { price_cents: 69900, discount_percent: 15, points_per_ten: 1, cashback_percent: 3 },
  { price_cents: 119900, discount_percent: 20, points_per_ten: 2, cashback_percent: 5 },
];

const people = [
  ["Mariana Soto", "MP-K7Q4N", 3, 485, 2550],
  ["Andrés Paredes", "MP-T2H9X", 2, 212, 800],
  ["Lucía Montalvo", "MP-B5R8D", 1, 96, 0],
  ["Iván Cordero", "MP-W4J6M", 2, 140, 400],
  ["Renata Villaseñor", "MP-R3W8D", 4, 1210, 9150],
  ["Diego Almanza", "MP-N6C2K", 3, 378, 1900],
  ["Paola Quintero", "MP-H9P4T", 2, 64, 0],
  ["Tomás Beltrán", "MP-F7S3Q", 1, 33, 0],
  ["Camila Ibarra", "MP-M8V5Z", 3, 521, 3300],
  ["Héctor Salgado", "MP-D4G7L", 1, 18, 0],
  ["Valeria Núñez", "MP-S6X9A", 4, 940, 7200],
  ["Rodrigo Escamilla", "MP-Y3K2E", 2, 77, 150],
].map(([name, code, level, points, cashback], index) => ({
  id: index + 1,
  name,
  code,
  level,
  points,
  cashback,
  issuedDaysAgo: [40, 12, 75, 5, 58, 22, 33, 9, 18, 3, 47, 28][index],
  validDaysLeft: [330, 12, 280, 160, 90, 8, 250, 300, 19, 340, 120, 200][index],
}));

const dayMs = 24 * 60 * 60 * 1000;
const nowMs = Date.now();

function daysFromNow(days) {
  return new Date(nowMs + days * dayMs).toISOString();
}

function session(request) {
  const cookie = request.headers.cookie ?? "";
  const token = /access_token=([^;]+)/.exec(cookie)?.[1];
  if (!token) return null;
  const [role = "cashier", locale = "es", business = "volcan"] = token.split(".");
  return {
    role,
    locale: locale === "en" ? "en" : "es",
    business: businesses[business] ?? businesses.volcan,
  };
}

function tiers(locale) {
  return tierRows.map((row, index) => ({
    id: index + 1,
    name: copy[locale].tiers[index],
    finish: finishes[index],
    ...row,
    customers_count: people.filter((person) => person.level === index + 1).length,
  }));
}

function customer(person, locale) {
  const tier = tiers(locale)[person.level - 1];
  return {
    id: person.id,
    code: person.code,
    full_name: person.name,
    email: `${person.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]+/g, ".")}@ejemplo.test`,
    phone: "664 555 01" + String(person.id).padStart(2, "0"),
    level: { id: tier.id, name: tier.name, finish: tier.finish },
    status: "active",
    expiring_soon: person.validDaysLeft <= 30,
    issued_at: daysFromNow(-person.issuedDaysAgo),
    valid_until: person.id === 1 ? "2027-03-14T10:00:00Z" : daysFromNow(person.validDaysLeft),
    points_balance: person.points,
    cashback_balance_cents: person.cashback,
    benefits: {
      discount_percent: tier.discount_percent,
      points_per_ten: tier.points_per_ten,
      cashback_percent: tier.cashback_percent,
    },
    last_purchase_at: "2026-11-18T16:20:00Z",
    photo_url: null,
  };
}

function seeded(seed) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function buildHistory(locale) {
  const next = seeded(7);
  const rows = [];
  let id = 1;
  for (let day = 89; day >= 0; day -= 1) {
    const weekday = new Date(nowMs - day * dayMs).getDay();
    const count = 1 + Math.floor(next() * (weekday === 5 || weekday === 6 ? 6 : 4));
    for (let index = 0; index < count; index += 1) {
      const person = people[Math.floor(next() * next() * people.length)];
      const tier = tiers(locale)[person.level - 1];
      const amount = Math.round((150 + next() * 1500) / 10) * 1000;
      const discount = Math.round((amount * tier.discount_percent) / 100);
      const total = amount - discount;
      const createdAt = new Date(nowMs - day * dayMs - Math.floor(next() * 10) * 3600 * 1000).toISOString();
      rows.push({
        id: id++,
        created_at: createdAt,
        customer: { id: person.id, full_name: person.name, code: person.code },
        cashier_name: copy[locale].cashier,
        card_status: "active",
        concept: copy[locale].concept,
        amount_cents: amount,
        discount_percent: tier.discount_percent,
        discount_cents: discount,
        cashback_used_cents: 0,
        total_cents: total,
        points_delta: Math.floor(total / 1000) * tier.points_per_ten,
        cashback_earned_cents: Math.round((total * tier.cashback_percent) / 100),
      });
    }
  }
  return rows.sort((first, second) => second.created_at.localeCompare(first.created_at));
}

const histories = { es: buildHistory("es"), en: buildHistory("en") };

function movements(locale) {
  return histories[locale];
}

function receipt(locale) {
  const person = people[0];
  const tier = tiers(locale)[2];
  return {
    id: 1,
    created_at: "2026-11-18T16:20:00Z",
    card_status: "active",
    customer: { id: person.id, full_name: person.name, code: person.code },
    level: { id: tier.id, name: tier.name, finish: tier.finish },
    concept: copy[locale].concept,
    amount_cents: 100000,
    discount_percent: 15,
    discount_cents: 15000,
    cashback_used_cents: 0,
    total_cents: 85000,
    points_earned: 85,
    cashback_earned_cents: 2550,
    points_balance_after: person.points + 85,
    cashback_balance_after_cents: person.cashback + 2550,
  };
}

function send(response, status, payload) {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  response.writeHead(status, { "content-type": typeof payload === "string" ? "text/plain" : "application/json" });
  response.end(body);
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://mock");
  const path = url.pathname.replace(/^\/api\/v1/, "");
  const current = session(request);

  if (path === "/health") return send(response, 200, { ok: true });

  const cardMatch = /^\/card\/([^/]+)$/.exec(path);
  if (cardMatch) {
    const publicLocale = cardMatch[1].endsWith("-en") ? "en" : "es";
    const person = people[0];
    const tier = tiers(publicLocale)[person.level - 1];
    return send(response, 200, {
      business: { name: businesses.volcan.name, logo_url: null, primary_color: null, primary_foreground: null },
      full_name: person.name,
      code: person.code,
      level: { name: tier.name, finish: tier.finish },
      status: "active",
      valid_until: "2027-03-14T10:00:00Z",
      wallet: { google: true },
    });
  }
  if (!current) return send(response, 401, { code: "unauthorized" });

  const { locale, business, role } = current;

  if (path === "/auth/me") {
    return send(response, 200, {
      id: role === "admin" ? 1 : 2,
      business_id: business.id,
      name: role === "admin" ? copy[locale].admin : copy[locale].cashier,
      email: `${role}@ejemplo.test`,
      role: role === "admin" ? "admin" : "employee",
      is_active: true,
      photo_url: null,
      business: {
        id: business.id,
        name: business.name,
        logo_url: null,
        status: "active",
        validity_months: 12,
        primary_color: business.primary_color,
        primary_foreground: business.primary_foreground,
      },
    });
  }

  if (path === "/customer/lookup") {
    const code = (url.searchParams.get("code") ?? "").toUpperCase();
    const person = people.find((item) => item.code === code);
    return person ? send(response, 200, customer(person, locale)) : send(response, 404, { code: "customer_not_found" });
  }

  if (path === "/customer/summary") {
    return send(response, 200, {
      all: people.length,
      active: people.length,
      expiring: people.filter((person) => person.validDaysLeft <= 30).length,
      expired: 0,
      cancelled: 0,
    });
  }

  if (path === "/customer/list") {
    const query = (url.searchParams.get("q") ?? "").toLowerCase();
    const levelId = Number(url.searchParams.get("level_id") ?? 0);
    const pageSize = Number(url.searchParams.get("page_size") ?? 10);
    const page = Number(url.searchParams.get("page") ?? 1);
    const statusFilter = url.searchParams.get("status");
    const filtered = people.filter(
      (person) =>
        (!query || person.name.toLowerCase().includes(query) || person.code.toLowerCase().includes(query)) &&
        (!levelId || person.level === levelId) &&
        (statusFilter !== "expiring" || person.validDaysLeft <= 30),
    );
    const items = filtered.slice((page - 1) * pageSize, page * pageSize).map((person) => customer(person, locale));
    return send(response, 200, { items, total: filtered.length, page, page_size: pageSize });
  }

  if (path === "/tier/list") return send(response, 200, tiers(locale));

  if (path === "/movement/list") {
    const customerId = Number(url.searchParams.get("customer_id") ?? 0);
    const query = (url.searchParams.get("q") ?? "").toLowerCase();
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const all = movements(locale).filter(
      (row) =>
        (!customerId || row.customer.id === customerId) &&
        (!query || row.customer.full_name.toLowerCase().includes(query) || row.customer.code.toLowerCase().includes(query)) &&
        (!from || row.created_at >= from) &&
        (!to || row.created_at < to),
    );
    const pageSize = Number(url.searchParams.get("page_size") ?? 10);
    const page = Number(url.searchParams.get("page") ?? 1);
    return send(response, 200, {
      items: all.slice((page - 1) * pageSize, page * pageSize),
      total: all.length,
      page,
      page_size: pageSize,
      summary: {
        count: all.length,
        collected_cents: all.reduce((sum, row) => sum + row.total_cents, 0),
        discount_cents: all.reduce((sum, row) => sum + row.discount_cents, 0),
        cashback_used_cents: 0,
      },
    });
  }

  if (path === "/checkout/create") return send(response, 200, receipt(locale));
  if (/^\/checkout\/\d+$/.test(path)) return send(response, 200, receipt(locale));

  if (/^\/customer\/\d+\/payment\/list$/.test(path)) {
    return send(response, 200, {
      items: [
        {
          id: 1,
          created_at: "2026-03-14T10:00:00Z",
          kind: "new",
          method: "cash",
          amount_cents: 69900,
          level: { id: 3, name: copy[locale].tiers[2] },
          period_start: "2026-03-14T10:00:00Z",
          period_end: "2027-03-14T10:00:00Z",
          recorded_by_name: copy[locale].admin,
        },
      ],
      total: 1,
      page: 1,
      page_size: 6,
    });
  }

  const customerMatch = /^\/customer\/(\d+)$/.exec(path);
  if (customerMatch) {
    const person = people.find((item) => item.id === Number(customerMatch[1]));
    return person ? send(response, 200, customer(person, locale)) : send(response, 404, { code: "customer_not_found" });
  }

  console.log("unhandled", request.method, request.url);
  return send(response, 404, { code: "not_found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`mock api on ${port}`);
});
