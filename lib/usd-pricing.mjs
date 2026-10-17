import { readFileSync } from "node:fs";
const policy = JSON.parse(
  readFileSync(new URL("../data/pricing-policy.json", import.meta.url), "utf8"),
);

// Input is the equivalent USD value after conversion, not the original currency amount.
export function roundUsdPrice(convertedUsd) {
  if (!Number.isFinite(convertedUsd) || convertedUsd < 0)
    throw new RangeError("USD value must be finite and non-negative");
  const cents = Math.round(convertedUsd * 100);
  return Math.max(
    policy.minimum_amount_cents,
    Math.round((cents - policy.tier_offset_cents) / policy.tier_step_cents) *
      policy.tier_step_cents +
      policy.tier_offset_cents,
  );
}
