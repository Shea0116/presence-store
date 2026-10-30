import test from "node:test";
import assert from "node:assert/strict";
import {
  addToCart,
  sanitizeCart,
  updateQuantity,
  cartTotals,
  money,
} from "../src/store.ts";

test("same product and color merge, different colors remain separate", () => {
  let c = addToCart([], "morning-mug", "Chalk", 2);
  c = addToCart(c, "morning-mug", "Chalk", 1);
  c = addToCart(c, "morning-mug", "Clay", 2);
  assert.deepEqual(c, [
    { productId: "morning-mug", color: "Chalk", quantity: 3 },
    { productId: "morning-mug", color: "Clay", quantity: 2 },
  ]);
});
test("stock is shared across all variants and malformed storage is discarded", () => {
  const c = sanitizeCart([
    { productId: "slow-chair", color: "Natural", quantity: 2 },
    { productId: "slow-chair", color: "Walnut", quantity: 9 },
    { productId: "unknown", color: "x", quantity: 1 },
    null,
    { productId: "morning-mug", color: "Chalk", quantity: -1 },
    { productId: "morning-mug", color: "Missing", quantity: 2 },
  ]);
  assert.equal(c.length, 2);
  assert.equal(
    c.reduce((s, i) => s + i.quantity, 0),
    3,
  );
  assert.deepEqual(sanitizeCart({}), []);
});
test("decreasing to zero removes an item and quantity cannot exceed stock", () => {
  let c = addToCart([], "morning-mug", "Chalk");
  c = updateQuantity(c, "morning-mug", "Chalk", 99);
  assert.equal(c[0].quantity, 12);
  assert.deepEqual(updateQuantity(c, "morning-mug", "Chalk", 0), []);
});
test("shipping is $8 below $100, free from $100, and zero for an empty cart", () => {
  assert.deepEqual(cartTotals([]), {
    count: 0,
    subtotal: 0,
    shipping: 0,
    total: 0,
  });
  assert.deepEqual(cartTotals(addToCart([], "morning-mug", "Chalk", 3)), {
    count: 3,
    subtotal: 84,
    shipping: 8,
    total: 92,
  });
  const c = addToCart(
    addToCart([], "everyday-tote", "Sand", 2),
    "ripple-glass",
    "Clear",
  );
  assert.equal(cartTotals(c).subtotal, 102);
  assert.equal(cartTotals(c).shipping, 0);
  const exact100 = addToCart(
    addToCart([], "morning-mug", "Chalk"),
    "studio-vase",
    "Sand",
    2,
  );
  assert.equal(cartTotals(exact100).subtotal, 100);
  assert.equal(cartTotals(exact100).shipping, 0);
});
test("increasing a variant preserves stock already assigned to other variants", () => {
  const cart = [
    { productId: "slow-chair", color: "Natural", quantity: 1 },
    { productId: "slow-chair", color: "Walnut", quantity: 1 },
  ];
  const updated = updateQuantity(cart, "slow-chair", "Natural", 99);
  assert.equal(updated[0].quantity, 2);
  assert.equal(updated[1].quantity, 1);
});
test("currency values use the documented fixed rates", () => {
  assert.equal(money(100, "USD"), "$100.00");
  assert.match(money(100, "GBP"), /79\.00/);
  assert.match(money(100, "EUR"), /92,00/);
});
