export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a minutes value like "25 min" or "1 hr 10 min". */
export function formatMinutes(min?: number | null): string | null {
  if (min == null || Number.isNaN(min) || min <= 0) return null;
  if (min < 60) return `${min} min`;
  const hrs = Math.floor(min / 60);
  const rem = min % 60;
  return rem === 0 ? `${hrs} hr` : `${hrs} hr ${rem} min`;
}

export function titleCase(s?: string | null): string {
  if (!s) return "";
  return s
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function nutritionValue(v: string | number | undefined): string {
  if (v == null) return "—";
  if (typeof v === "number") return `${v}g`;
  return v;
}

// ---------- Ingredient scaling (Approach A: client-side, no regeneration) ----------

const UNICODE_FRACTIONS: Record<string, number> = {
  "¼": 0.25, "½": 0.5, "¾": 0.75,
  "⅓": 1 / 3, "⅔": 2 / 3,
  "⅕": 0.2, "⅖": 0.4, "⅗": 0.6, "⅘": 0.8,
  "⅙": 1 / 6, "⅚": 5 / 6,
  "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
};

// Unicode fraction characters, for use inside regex character classes.
const UNI = "¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞";

// Candidate fractions we round to when formatting (nice, kitchen-friendly).
const FRACTION_STEPS: Array<{ v: number; s: string }> = [
  { v: 0, s: "" },
  { v: 1 / 8, s: "⅛" },
  { v: 1 / 4, s: "¼" },
  { v: 1 / 3, s: "⅓" },
  { v: 3 / 8, s: "⅜" },
  { v: 1 / 2, s: "½" },
  { v: 5 / 8, s: "⅝" },
  { v: 2 / 3, s: "⅔" },
  { v: 3 / 4, s: "¾" },
  { v: 7 / 8, s: "⅞" },
  { v: 1, s: "" },
];

/** Parse a single quantity token: "2", "1.5", "1/2", "1 1/2", "1½", "½". */
function parseQty(token: string): number | null {
  const t = token.trim();
  if (t.length === 1 && UNICODE_FRACTIONS[t] != null) return UNICODE_FRACTIONS[t];

  let m = t.match(new RegExp(`^(\\d+)\\s*([${UNI}])$`)); // "1½"
  if (m) return parseInt(m[1], 10) + UNICODE_FRACTIONS[m[2]];

  m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/); // "1 1/2"
  if (m) return parseInt(m[1], 10) + parseInt(m[2], 10) / parseInt(m[3], 10);

  m = t.match(/^(\d+)\/(\d+)$/); // "1/2"
  if (m) return parseInt(m[1], 10) / parseInt(m[2], 10);

  const n = parseFloat(t); // "2", "1.5"
  return Number.isFinite(n) ? n : null;
}

/** Format a number as a kitchen-friendly amount: 3.25 → "3¼", 0.5 → "½", 3 → "3". */
export function formatQty(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  let whole = Math.floor(value);
  const rem = value - whole;

  let best = FRACTION_STEPS[0];
  let bestDiff = Infinity;
  for (const f of FRACTION_STEPS) {
    const d = Math.abs(rem - f.v);
    if (d < bestDiff) {
      bestDiff = d;
      best = f;
    }
  }
  let frac = best.s;
  if (best.v === 1) {
    whole += 1;
    frac = "";
  }

  if (whole === 0 && frac === "") return String(Math.round(value * 100) / 100);
  if (whole === 0) return frac;
  return frac ? `${whole}${frac}` : String(whole);
}

// A quantity, possibly a range. Order matters (mixed numbers before bare integers).
const QTY = `(?:\\d+\\s+\\d+\\/\\d+|\\d+\\s*[${UNI}]|\\d+\\/\\d+|\\d*\\.\\d+|\\d+|[${UNI}])`;
const LEADING_QTY = new RegExp(`^(\\s*)(${QTY})(\\s*(?:-|–|—|to)\\s*(${QTY}))?`);

/**
 * Scale the leading quantity of an ingredient line by `factor`, keeping the unit and
 * item text untouched. Lines without a leading number (e.g. "salt to taste") are
 * returned unchanged. Handles fractions, mixed numbers, decimals, and ranges.
 */
export function scaleIngredient(line: string, factor: number): string {
  if (!Number.isFinite(factor) || factor <= 0 || Math.abs(factor - 1) < 1e-9) return line;

  const m = LEADING_QTY.exec(line);
  if (!m) return line;

  const full = m[0];
  const leadWs = m[1] ?? "";
  const low = parseQty(m[2]);
  if (low == null) return line;

  const rest = line.slice(full.length);

  if (m[4] != null) {
    const high = parseQty(m[4]);
    if (high == null) return line;
    return `${leadWs}${formatQty(low * factor)}–${formatQty(high * factor)}${rest}`;
  }
  return `${leadWs}${formatQty(low * factor)}${rest}`;
}
