import { products } from "./data.ts";
export type CartItem = { productId: string; color: string; quantity: number };
export const CART_KEY = "presence-cart-v1";
export const currencies = {
  USD: { rate: 1, locale: "en-US" },
  EUR: { rate: 0.92, locale: "de-DE" },
  GBP: { rate: 0.79, locale: "en-GB" },
};
export type Currency = keyof typeof currencies;
export function money(value: number, currency: Currency) {
  return new Intl.NumberFormat(currencies[currency].locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value * currencies[currency].rate);
}
export function sanitizeCart(input: unknown): CartItem[] {
  if (!Array.isArray(input)) return [];
  const result: CartItem[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const p = products.find((p) => p.id === item.productId);
    if (
      !p ||
      !p.colors.some((c) => c.name === item.color) ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    )
      continue;
    const available =
      p.stock -
      result
        .filter((i) => i.productId === p.id)
        .reduce((s, i) => s + i.quantity, 0);
    const quantity = Math.min(item.quantity, available);
    if (quantity <= 0) continue;
    const existing = result.find(
      (i) => i.productId === p.id && i.color === item.color,
    );
    if (existing) existing.quantity += quantity;
    else result.push({ productId: p.id, color: item.color, quantity });
  }
  return result;
}
export function addToCart(
  cart: CartItem[],
  productId: string,
  color: string,
  quantity = 1,
) {
  return sanitizeCart([...cart, { productId, color, quantity }]);
}
export function updateQuantity(
  cart: CartItem[],
  productId: string,
  color: string,
  quantity: number,
) {
  const p = products.find((p) => p.id === productId);
  if (!p) return sanitizeCart(cart);
  const otherVariants = cart
    .filter((i) => i.productId === productId && i.color !== color)
    .reduce((s, i) => s + i.quantity, 0);
  const clamped = Math.min(quantity, Math.max(0, p.stock - otherVariants));
  return sanitizeCart(
    cart.map((i) =>
      i.productId === productId && i.color === color
        ? { ...i, quantity: clamped }
        : i,
    ),
  );
}
export function cartTotals(cart: CartItem[]) {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      (products.find((p) => p.id === item.productId)?.price ?? 0) *
        item.quantity,
    0,
  );
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 8;
  return { count, subtotal, shipping, total: subtotal + shipping };
}
