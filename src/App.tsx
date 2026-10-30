import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Globe2,
  Heart,
  Leaf,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { categories, products } from "./data";
import type { Product } from "./data";
import {
  addToCart,
  CART_KEY,
  cartTotals,
  currencies,
  money,
  sanitizeCart,
  updateQuantity,
} from "./store";
import type { CartItem, Currency } from "./store";
import { Modal } from "./components/Modal";

function readStored(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
}
function ProductImage({
  product,
  ...props
}: { product: Product } & React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={`/images/${product.image}.jpg`}
      alt={product.name}
      {...props}
      onError={(e) => {
        e.currentTarget.style.visibility = "hidden";
      }}
    />
  );
}
export default function App() {
  const [cart, setCart] = useState<CartItem[]>(() =>
    sanitizeCart(readStored(CART_KEY)),
  );
  const [currency, setCurrency] = useState<Currency>(() => {
    const c = readStored("presence-currency");
    return typeof c === "string" && c in currencies ? (c as Currency) : "USD";
  });
  const [saved, setSaved] = useState<string[]>(() => {
    const s = readStored("presence-saved");
    return Array.isArray(s)
      ? s.filter((id) => products.some((p) => p.id === id))
      : [];
  });
  const [category, setCategory] = useState("All objects");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [onlySaved, setOnlySaved] = useState(false);
  const [under75, setUnder75] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [detail, setDetail] = useState<Product | null>(null);
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [storageWarning, setStorageWarning] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const totals = cartTotals(cart);
  const price = (n: number) => money(n, currency);
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      localStorage.setItem("presence-saved", JSON.stringify(saved));
      localStorage.setItem("presence-currency", JSON.stringify(currency));
    } catch {
      setStorageWarning(true);
    }
  }, [cart, saved, currency]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);
  const visible = useMemo(() => {
    const result = products.filter(
      (p) =>
        (category === "All objects" || p.category === category) &&
        (!onlySaved || saved.includes(p.id)) &&
        (!under75 || p.price < 75) &&
        `${p.name} ${p.category} ${p.description} ${p.material}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    );
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sort === "rating")
      result.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    return result;
  }, [category, query, sort, onlySaved, saved, under75]);
  const inCart = (id: string) =>
    cart.filter((i) => i.productId === id).reduce((s, i) => s + i.quantity, 0);
  const toggleSaved = (p: Product) => {
    setSaved((s) =>
      s.includes(p.id) ? s.filter((id) => id !== p.id) : [...s, p.id],
    );
  };
  const openProduct = (p: Product) => {
    setDetail(p);
    setColor(p.colors[0].name);
    setQuantity(1);
  };
  const add = (p: Product, variant = p.colors[0].name, qty = 1) => {
    if (inCart(p.id) + qty > p.stock) {
      setToast("You’ve reached the available quantity for this item.");
      return;
    }
    setCart((c) => addToCart(c, p.id, variant, qty));
    setToast(`${p.name} added to your bag`);
  };
  const shop = (next = "All objects") => {
    setCategory(next);
    setOnlySaved(false);
    setMobileMenu(false);
    document
      .getElementById("collection")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  const clearFilters = () => {
    setCategory("All objects");
    setQuery("");
    setOnlySaved(false);
    setUnder75(false);
  };
  const closeCart = () => {
    setCartOpen(false);
    setCheckout(false);
    setOrderComplete(false);
  };

  return (
    <>
      <a className="skip-link" href="#collection">
        Skip to products
      </a>
      <div className="announcement">
        <span>
          Good things, delivered. Free shipping on orders {price(100)}+
        </span>
        <span className="announcement-right">
          Thoughtfully chosen. Made for everyday.
        </span>
      </div>
      <header className="header">
        <button
          className="icon-button mobile-menu"
          aria-label="Open navigation"
          onClick={() => setMobileMenu(true)}
        >
          <Menu size={23} />
        </button>
        <a href="#" className="brand" aria-label="Presence home">
          presence<span>®</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <button onClick={() => shop()}>
            Shop all <ChevronDown size={13} />
          </button>
          <button onClick={() => shop("Home & living")}>Home & living</button>
          <button onClick={() => shop("Everyday carry")}>Everyday carry</button>
          <button onClick={() => setInfo("Our point of view")}>
            Our story
          </button>
        </nav>
        <div className="header-actions">
          <label className="currency">
            <Globe2 size={15} />
            <select
              aria-label="Display currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
            >
              {Object.keys(currencies).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <button
            className="icon-button header-search"
            aria-label="Search products"
            onClick={() => {
              shop();
              searchRef.current?.focus();
            }}
          >
            <Search size={21} />
          </button>
          <button
            className={`icon-button ${onlySaved ? "active" : ""}`}
            aria-label={`Saved items (${saved.length})`}
            onClick={() => {
              setOnlySaved((s) => !s);
              document
                .getElementById("collection")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Heart size={21} fill={onlySaved ? "currentColor" : "none"} />
          </button>
          <button
            className="bag-button"
            aria-label={`Open shopping bag, ${totals.count} items`}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={20} />
            <span className="bag-label">Bag</span>
            <span className="bag-count">{totals.count}</span>
          </button>
        </div>
      </header>
      <main>
        <section className="hero" aria-labelledby="hero-heading">
          <img
            src="/images/hero.jpg"
            className="hero-image"
            alt="A sunlit living room with a soft linen sofa, natural wood and considered everyday objects"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="eyebrow">
              <span /> LESS, BUT BETTER
            </div>
            <h1 id="hero-heading">
              A little more
              <br />
              meaning in
              <br />
              <em>the everyday.</em>
            </h1>
            <p>
              Thoughtful objects for the spaces you love
              <br className="desktop-break" /> and the moments that make them
              yours.
            </p>
            <button className="button hero-cta" onClick={() => shop()}>
              Explore the collection <ArrowUpRight size={19} />
            </button>
            <div className="hero-note">
              <span className="tiny-line" /> Considered design. Lasting company.
            </div>
          </div>
          <div className="hero-caption">
            <span>THE ART OF LIVING WELL</span>
            <span>Collection No. 01 / Everyday essentials</span>
          </div>
          <div className="hero-index">
            01 <span>/ 01</span>
          </div>
        </section>
        <div className="promise-bar">
          <span>
            <Leaf size={18} /> Thoughtfully sourced
          </span>
          <span>
            <Truck size={19} /> International delivery
          </span>
          <span>
            <PackageCheck size={18} /> 30-day easy returns
          </span>
          <span>
            <ShieldCheck size={18} /> A little care in every detail
          </span>
        </div>
        <section
          id="collection"
          className="collection"
          aria-labelledby="collection-heading"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE EVERYDAY EDIT</p>
              <h2 id="collection-heading">
                Good things. <em>Well chosen.</em>
              </h2>
              <p className="section-description">
                Objects to use, love, and keep around.
              </p>
            </div>
            <span className="collection-note">
              A smaller collection.
              <br />A little more intention.
            </span>
          </div>
          <div className="catalog-toolbar">
            <div
              className="categories"
              role="group"
              aria-label="Product category"
            >
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={category === c ? "selected" : ""}
                >
                  {c}
                  {c === "All objects" && <span>{products.length}</span>}
                </button>
              ))}
            </div>
            <label className="search-field">
              <Search size={18} />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find your everyday favorite"
                aria-label="Search the collection"
              />
              {query && (
                <button
                  aria-label="Clear search"
                  className="icon-button"
                  onClick={() => setQuery("")}
                >
                  <X size={15} />
                </button>
              )}
            </label>
          </div>
          <div className="results-toolbar">
            <p aria-live="polite">
              {visible.length} thoughtfully chosen{" "}
              {visible.length === 1 ? "object" : "objects"}
              {onlySaved ? " · Your saved edit" : ""}
            </p>
            <div>
              <button
                className={`filter-button ${under75 ? "active" : ""}`}
                onClick={() => setFiltersOpen((s) => !s)}
                aria-expanded={filtersOpen}
              >
                <SlidersHorizontal size={15} /> Filters{under75 && " (1)"}
              </button>
              <span className="toolbar-divider" />
              <label className="sort-label">
                <span>Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort products"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="rating">Top rated</option>
                </select>
              </label>
            </div>
          </div>
          {filtersOpen && (
            <div className="filter-panel">
              <label>
                <input
                  type="checkbox"
                  checked={under75}
                  onChange={(e) => setUnder75(e.target.checked)}
                />{" "}
                Under {price(75)} (base price)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={onlySaved}
                  onChange={(e) => setOnlySaved(e.target.checked)}
                />{" "}
                My saved objects
              </label>
              <button onClick={clearFilters} className="text-button">
                Reset filters
              </button>
            </div>
          )}
          {(onlySaved || under75 || query || category !== "All objects") && (
            <div className="active-filters">
              {onlySaved && (
                <button onClick={() => setOnlySaved(false)}>
                  Saved items <X size={12} />
                </button>
              )}
              {under75 && (
                <button onClick={() => setUnder75(false)}>
                  Under {price(75)} <X size={12} />
                </button>
              )}
              {category !== "All objects" && (
                <button onClick={() => setCategory("All objects")}>
                  {category} <X size={12} />
                </button>
              )}
              {query && <span>Search: “{query}”</span>}
              <button className="reset-all" onClick={clearFilters}>
                Clear all
              </button>
            </div>
          )}
          <div className="product-grid">
            {visible.map((p) => (
              <article className="product-card" key={p.id}>
                <div className={`product-photo photo-${p.image}`}>
                  <button
                    className="image-link"
                    onClick={() => openProduct(p)}
                    aria-label={`View ${p.name}`}
                  >
                    <ProductImage product={p} loading="lazy" />
                    <span className="quick-view">
                      Discover the details <ArrowUpRight size={15} />
                    </span>
                  </button>
                  {p.badge && (
                    <span
                      className={`product-badge ${p.previousPrice ? "sale" : ""}`}
                    >
                      {p.badge}
                    </span>
                  )}
                  <button
                    className={`save-button ${saved.includes(p.id) ? "is-saved" : ""}`}
                    onClick={() => toggleSaved(p)}
                    aria-label={`${saved.includes(p.id) ? "Unsave" : "Save"} ${p.name}`}
                    aria-pressed={saved.includes(p.id)}
                  >
                    <Heart
                      size={18}
                      fill={saved.includes(p.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <div className="product-meta">
                  <span>{p.category}</span>
                  <div className="rating">
                    <Star size={11} fill="currentColor" />
                    {p.rating}
                  </div>
                </div>
                <div className="product-name-row">
                  <button onClick={() => openProduct(p)}>
                    <h3>{p.name}</h3>
                  </button>
                  <span>{price(p.price)}</span>
                </div>
                <div className="product-bottom">
                  <div className="swatches">
                    {p.colors.map((c) => (
                      <span
                        key={c.name}
                        style={{ background: c.hex }}
                        title={c.name}
                      />
                    ))}
                    <span className="color-caption">
                      {p.colors.length > 1
                        ? `${p.colors.length} colors`
                        : "One perfect shade"}
                    </span>
                    {p.previousPrice && <del>{price(p.previousPrice)}</del>}
                  </div>
                  <button
                    className="add-button"
                    aria-label={`Add ${p.name} to bag`}
                    disabled={inCart(p.id) >= p.stock}
                    onClick={() => add(p)}
                  >
                    {inCart(p.id) >= p.stock ? (
                      <Check size={17} />
                    ) : (
                      <Plus size={18} />
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
          {visible.length === 0 && (
            <div className="empty-state">
              <Search size={32} />
              <h3>A little room for discovery.</h3>
              <p>
                {onlySaved
                  ? "Save a few favorites with the heart on each object."
                  : "We couldn’t find an object matching these filters."}
              </p>
              <button className="button button-dark" onClick={clearFilters}>
                Explore all objects <ArrowRight size={16} />
              </button>
            </div>
          )}
          <div className="collection-end">
            <span />
            <p>You’ve seen the whole edit. Each one, here for a reason.</p>
            <span />
          </div>
        </section>
        <section className="story-strip">
          <div className="story-symbol">
            <Leaf size={37} strokeWidth={1} />
          </div>
          <div>
            <p className="eyebrow">FEWER THINGS. MORE MEANING.</p>
            <h2>Make space for what matters.</h2>
            <p>
              We believe the best things don’t ask for attention.
              <br />
              They quietly make your everyday a little better.
            </p>
          </div>
          <button
            className="story-link"
            onClick={() => setInfo("Our point of view")}
          >
            A note on Presence <ArrowUpRight size={20} />
          </button>
        </section>
      </main>
      <footer>
        <div className="footer-top">
          <a href="#" className="brand">
            presence<span>®</span>
          </a>
          <p>Objects for a more considered everyday.</p>
          <div>
            <button onClick={() => setInfo("Shipping & returns")}>
              Shipping & returns
            </button>
            <button onClick={() => setInfo("A little help")}>
              A little help
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Presence. Take your time.</span>
          <span>Independent storefront concept · Demo collection</span>
          <span>
            <Globe2 size={13} /> English / {currency}
          </span>
        </div>
      </footer>
      {storageWarning && (
        <div className="storage-warning" role="status">
          Browser storage is unavailable. Your bag will last for this visit
          only.
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{toast}</span>
          <button
            onClick={() => {
              setToast("");
              setDetail(null);
              setCartOpen(true);
            }}
          >
            View bag <ArrowRight size={14} />
          </button>
        </div>
      )}

      {mobileMenu && (
        <Modal title="Navigation" drawer onClose={() => setMobileMenu(false)}>
          <div className="mobile-nav">
            <span className="brand">
              presence<span>®</span>
            </span>
            <p className="eyebrow">FIND YOUR EVERYDAY</p>
            {categories.map((c) => (
              <button key={c} onClick={() => shop(c)}>
                {c}
                <ArrowUpRight size={20} />
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenu(false);
                setInfo("Our point of view");
              }}
            >
              Our story <ArrowUpRight size={20} />
            </button>
          </div>
        </Modal>
      )}
      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          <div className="product-detail">
            <div className={`detail-photo photo-${detail.image}`}>
              <ProductImage product={detail} />
              {detail.badge && (
                <span className="product-badge">{detail.badge}</span>
              )}
            </div>
            <div className="detail-content">
              <p className="eyebrow">{detail.category}</p>
              <h2>{detail.name}</h2>
              <div className="detail-price">
                {price(detail.price)}{" "}
                {detail.previousPrice && (
                  <del>{price(detail.previousPrice)}</del>
                )}
                <span>
                  <Star size={13} fill="currentColor" />
                  {detail.rating} ({detail.reviews} reviews)
                </span>
              </div>
              <p className="detail-description">{detail.description}</p>
              <p className="variant-label">
                Color <strong>{color}</strong>
              </p>
              <div className="detail-swatches">
                {detail.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    aria-label={`Color: ${c.name}`}
                    aria-pressed={color === c.name}
                    className={color === c.name ? "chosen" : ""}
                    style={{ background: c.hex }}
                  >
                    {color === c.name && <Check size={15} />}
                  </button>
                ))}
              </div>
              <p className="stock-note">
                <span />
                {detail.stock - inCart(detail.id) > 0
                  ? `${detail.stock - inCart(detail.id)} available · Ready for your everyday`
                  : "All available stock is in your bag"}
              </p>
              <div className="detail-add">
                <div className="quantity-control">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity === 1}
                  >
                    <Minus size={15} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    aria-label="Increase quantity"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(detail.stock - inCart(detail.id), q + 1),
                      )
                    }
                    disabled={quantity >= detail.stock - inCart(detail.id)}
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <button
                  className="button button-dark"
                  disabled={inCart(detail.id) + quantity > detail.stock}
                  onClick={() => {
                    add(detail, color, quantity);
                    setDetail(null);
                  }}
                >
                  Add to bag <ShoppingBag size={17} />
                </button>
              </div>
              <dl className="product-specs">
                <div>
                  <dt>Made of</dt>
                  <dd>{detail.material}</dd>
                </div>
                <div>
                  <dt>The details</dt>
                  <dd>{detail.dimensions}</dd>
                </div>
                <div>
                  <dt>Delivery</dt>
                  <dd>5–10 business days · 30-day returns</dd>
                </div>
              </dl>
              <small className="sample-note">
                Concept product · Images are illustrative. Colors are simulated
                variants.
              </small>
            </div>
          </div>
        </Modal>
      )}
      {cartOpen && (
        <Modal title="Shopping bag" drawer onClose={closeCart}>
          <div className="cart-layout">
            <div className="cart-title">
              <p className="eyebrow">A FEW GOOD THINGS</p>
              <h2>
                {orderComplete
                  ? "A little joy, on its way."
                  : checkout
                    ? "Review your selection."
                    : "Your bag."}{" "}
                {!checkout && !orderComplete && <span>({totals.count})</span>}
              </h2>
            </div>
            {orderComplete ? (
              <div className="order-success">
                <div className="success-check">
                  <Check size={32} />
                </div>
                <h3>That’s the demo, beautifully wrapped.</h3>
                <p>
                  Your sample order is complete. No payment was collected and
                  nothing will be shipped.
                </p>
                <button className="button button-dark" onClick={closeCart}>
                  Keep discovering <ArrowRight size={16} />
                </button>
              </div>
            ) : totals.count === 0 ? (
              <div className="cart-empty">
                <ShoppingBag size={48} strokeWidth={1} />
                <h3>Good things take a little browsing.</h3>
                <p>Your bag is waiting for something you’ll love.</p>
                <button
                  className="button button-dark"
                  onClick={() => {
                    closeCart();
                    shop();
                  }}
                >
                  Explore the collection <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="shipping-progress">
                  <p>
                    <Truck size={16} />
                    {totals.subtotal >= 100 ? (
                      "A little extra: your shipping is on us."
                    ) : (
                      <>
                        You’re {price(100 - totals.subtotal)} away from free
                        shipping.
                      </>
                    )}
                  </p>
                  <div>
                    <span
                      style={{ width: `${Math.min(100, totals.subtotal)}%` }}
                    />
                  </div>
                </div>
                {checkout && (
                  <div className="demo-notice">
                    <ShieldCheck size={20} />
                    <div>
                      <strong>This is a demo checkout.</strong>
                      <p>
                        No address or payment is needed. Nothing will be charged
                        or shipped.
                      </p>
                    </div>
                  </div>
                )}
                <ul className="cart-items">
                  {cart.map((item) => {
                    const p = products.find((p) => p.id === item.productId)!;
                    return (
                      <li key={`${p.id}-${item.color}`}>
                        <div className={`cart-image photo-${p.image}`}>
                          <ProductImage product={p} />
                        </div>
                        <div className="cart-item-info">
                          <h3>{p.name}</h3>
                          <p>{item.color}</p>
                          <strong>{price(p.price)}</strong>
                          {!checkout && (
                            <div className="cart-item-actions">
                              <div className="quantity-control">
                                <button
                                  aria-label={`Decrease ${p.name} quantity`}
                                  onClick={() =>
                                    setCart((c) =>
                                      updateQuantity(
                                        c,
                                        p.id,
                                        item.color,
                                        item.quantity - 1,
                                      ),
                                    )
                                  }
                                >
                                  <Minus size={13} />
                                </button>
                                <span aria-label={`${p.name} quantity`}>
                                  {item.quantity}
                                </span>
                                <button
                                  aria-label={`Increase ${p.name} quantity`}
                                  disabled={inCart(p.id) >= p.stock}
                                  onClick={() =>
                                    setCart((c) =>
                                      updateQuantity(
                                        c,
                                        p.id,
                                        item.color,
                                        item.quantity + 1,
                                      ),
                                    )
                                  }
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                              <button
                                className="remove-button"
                                aria-label={`Remove ${p.name}`}
                                onClick={() =>
                                  setCart((c) =>
                                    c.filter(
                                      (i) =>
                                        !(
                                          i.productId === p.id &&
                                          i.color === item.color
                                        ),
                                    ),
                                  )
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                          {checkout && <small>Quantity: {item.quantity}</small>}
                        </div>
                        <span className="line-total">
                          {price(p.price * item.quantity)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <span>{price(totals.subtotal)}</span>
                  </div>
                  <div>
                    <span>Estimated shipping</span>
                    <span>
                      {totals.shipping === 0 ? "On us" : price(totals.shipping)}
                    </span>
                  </div>
                  <div className="total-row">
                    <strong>Estimated total</strong>
                    <strong>{price(totals.total)}</strong>
                  </div>
                  <p>
                    Demo pricing. Taxes and duties are not calculated.
                    {currency !== "USD" &&
                      " Currency conversion uses fixed demo rates."}
                  </p>
                  <button
                    className="button button-dark checkout-button"
                    onClick={() => {
                      if (checkout) {
                        setOrderComplete(true);
                        setCart([]);
                      } else setCheckout(true);
                    }}
                  >
                    {checkout ? "Complete demo order" : "Review demo checkout"}{" "}
                    <ArrowRight size={18} />
                  </button>
                  <button
                    className="continue-button"
                    onClick={() =>
                      checkout ? setCheckout(false) : closeCart()
                    }
                  >
                    {checkout ? "Back to your bag" : "Keep exploring"}
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
      {info && (
        <Modal title={info} onClose={() => setInfo(null)}>
          <div className="info-content">
            <p className="eyebrow">A NOTE FROM PRESENCE</p>
            <h2>{info}</h2>
            {info === "Our point of view" ? (
              <>
                <p>
                  Life is made of small moments. The cup you reach for. The
                  chair you settle into. The things that feel a little more like
                  you.
                </p>
                <p>
                  Presence is a concept store for those everyday companions:
                  useful objects, simple shapes, and a quieter way to choose.
                </p>
                <p>
                  Our small collection is intentionally edited. Less searching.
                  More finding something that belongs.
                </p>
              </>
            ) : info === "Shipping & returns" ? (
              <>
                <h3>A little closer, wherever you are.</h3>
                <p>
                  Our demo offers international standard delivery in 5–10
                  business days. Shipping is {price(8)}, or free for orders of{" "}
                  {price(100)} or more.
                </p>
                <h3>Room to change your mind.</h3>
                <p>
                  The concept policy allows returns within 30 days for unused
                  items. Real availability, destination restrictions, duties and
                  return labels would be confirmed by a production service.
                </p>
              </>
            ) : (
              <>
                <h3>Shopping, made simple.</h3>
                <p>
                  Browse the edit, search for an object, or choose a category.
                  Open a product to choose a color and add it to your bag. Your
                  bag and favorites stay in this browser.
                </p>
                <p>
                  Use the currency selector to view USD, EUR or GBP. Conversion
                  is illustrative, using fixed rates (USD 1 = EUR 0.92 = GBP
                  0.79).
                </p>
              </>
            )}
            <div className="info-footnote">
              This storefront is a portfolio demo with mock products and
              illustrative photography. No real orders or payments.
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
