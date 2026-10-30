export type Category = "Home & living" | "Kitchen & dining" | "Everyday carry";
export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  previousPrice?: number;
  image: string;
  badge?: string;
  colors: { name: string; hex: string }[];
  stock: number;
  description: string;
  material: string;
  dimensions: string;
  rating: number;
  reviews: number;
};
export const products: Product[] = [
  {
    id: "morning-mug",
    name: "The Morning Mug",
    category: "Kitchen & dining",
    price: 28,
    image: "mug",
    badge: "Bestseller",
    colors: [
      { name: "Chalk", hex: "#d9d3c6" },
      { name: "Clay", hex: "#a56b52" },
    ],
    stock: 12,
    description:
      "A little ritual, made better. A generous stoneware mug with a comfortable handle and a softly glazed finish. Made for the first quiet moment of your day.",
    material: "Glazed stoneware · Dishwasher and microwave safe",
    dimensions: "350 ml · 9 × 10 cm",
    rating: 4.9,
    reviews: 86,
  },
  {
    id: "linen-throw",
    name: "Sunday Soft Cushion",
    category: "Home & living",
    price: 78,
    previousPrice: 98,
    image: "linen",
    badge: "A little less",
    colors: [
      { name: "Oat", hex: "#c8b899" },
      { name: "Moss", hex: "#737c60" },
    ],
    stock: 7,
    description:
      "A softer spot for slow mornings and evenings on the sofa. A relaxed, textured cushion made to bring a little comfort to your favorite corner.",
    material: "Textured cotton-blend cover · Removable insert",
    dimensions: "45 × 45 cm",
    rating: 4.8,
    reviews: 42,
  },
  {
    id: "arc-lamp",
    name: "Arc Reading Lamp",
    category: "Home & living",
    price: 129,
    image: "lamp",
    badge: "New arrival",
    colors: [
      { name: "Warm white", hex: "#e5ddcf" },
      { name: "Charcoal", hex: "#4b4c47" },
    ],
    stock: 5,
    description:
      "Bring a warm pool of light to your favorite corner. A sculptural silhouette and soft, diffused glow make this a companion for late-night reading.",
    material: "Powder-coated metal · E27 LED bulb included",
    dimensions: "Height 145 cm · 110–240 V, regional plug included",
    rating: 4.9,
    reviews: 31,
  },
  {
    id: "everyday-tote",
    name: "Everyday Crossbody Bag",
    category: "Everyday carry",
    price: 42,
    image: "tote",
    colors: [
      { name: "Sand", hex: "#cbbb9d" },
      { name: "Ink", hex: "#3b4141" },
    ],
    stock: 10,
    description:
      "For market mornings, books, and everything in between. A structured everyday bag with an inside pocket and an adjustable shoulder strap.",
    material: "Woven body and vegan leather trim · Wipe clean",
    dimensions: "24 × 20 × 10 cm",
    rating: 4.7,
    reviews: 58,
  },
  {
    id: "studio-vase",
    name: "Studio Floor Vase",
    category: "Home & living",
    price: 36,
    image: "vase",
    badge: "Bestseller",
    colors: [
      { name: "Sand", hex: "#d5c7ab" },
      { name: "Clay", hex: "#ae8552" },
    ],
    stock: 8,
    description:
      "A simple home for a few tall stems. Organic curves and a warm ceramic finish add a quiet detail to your favorite corner.",
    material: "Hand-finished ceramic · Wipe clean",
    dimensions: "Height 48 cm · Diameter 18 cm",
    rating: 4.8,
    reviews: 64,
  },
  {
    id: "slow-chair",
    name: "The Slow Chair",
    category: "Home & living",
    price: 249,
    image: "chair",
    colors: [
      { name: "Natural", hex: "#c8b18c" },
      { name: "Walnut", hex: "#78563f" },
    ],
    stock: 3,
    description:
      "Your invitation to sit a little longer. A considered occasional chair with a supportive shape, made for reading corners and easy conversation.",
    material: "Solid ash frame · Upholstered seat",
    dimensions: "72 × 74 × 78 cm · Assembly required",
    rating: 4.9,
    reviews: 19,
  },
  {
    id: "ripple-glass",
    name: "Weekender Cocktail Glass",
    category: "Kitchen & dining",
    price: 18,
    image: "glass",
    colors: [{ name: "Clear", hex: "#d6dfda" }],
    stock: 16,
    description:
      "From sparkling water to something a little more celebratory. A stemmed cocktail glass, ready for celebrations big and small.",
    material: "Soda-lime glass · Dishwasher safe",
    dimensions: "320 ml · Height 12 cm",
    rating: 4.8,
    reviews: 47,
  },
  {
    id: "tea-ritual",
    name: "The Afternoon Cup",
    category: "Kitchen & dining",
    price: 54,
    image: "tea",
    badge: "New arrival",
    colors: [{ name: "Porcelain", hex: "#e3e0d6" }],
    stock: 6,
    description:
      "Take a moment for yourself. A simple ceramic cup for unhurried afternoons. Pour your favorite blend and enjoy a quiet pause.",
    material: "Glazed ceramic · Hand wash recommended",
    dimensions: "300 ml · 9 × 10 cm",
    rating: 4.9,
    reviews: 28,
  },
];
export const categories = [
  "All objects",
  "Home & living",
  "Kitchen & dining",
  "Everyday carry",
] as const;
