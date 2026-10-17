import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roundUsdPrice } from '../lib/usd-pricing.mjs';

test('equivalent USD values use the nearest x9.90 tier with a $9.90 floor', () => {
  for (const [value, cents] of [[0,990],[2.5,990],[9.9,990],[14,990],[14.9,1990],[20,1990],[28,2990],[50,4990],[100,9990],[200,19990]]) {
    assert.equal(roundUsdPrice(value), cents);
  }
  for (const value of [-1, NaN, Infinity, '20']) assert.throws(() => roundUsdPrice(value), RangeError);
});
