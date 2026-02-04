const products = [
  {
    id: 1,
    name: "Cuenta Steam - Payday 3",
    price: 27,
    category: "steam",
    description:
      "Steam Account con [Payday 3]. La cuenta puede tener más juegos/saldo/regalos/etc. Formato: login:pass. Fresh, checked y UHQ. Al abrir ticket te lo enviaremos.",
    badge: "Top"
  },
  {
    id: 2,
    name: "Cuenta Steam - Schedule",
    price: 22,
    category: "steam",
    description:
      "Steam Account con [Schedule]. La cuenta puede tener más juegos/saldo/regalos/etc. Formato: login:pass. Fresh, checked y UHQ. Al abrir ticket te lo enviaremos.",
    badge: "Nuevo"
  },
  {
    id: 3,
    name: "Cuenta Steam - Minecraft",
    price: 19,
    category: "steam",
    description:
      "Steam Account con [Minecraft]. La cuenta puede tener más juegos/saldo/regalos/etc. Formato: login:pass. Fresh, checked y UHQ. Al abrir ticket te lo enviaremos.",
    badge: "Popular"
  },
  {
    id: 4,
    name: "Cuenta Steam - GTA 6",
    price: 35,
    category: "steam",
    description:
      "Steam Account con [GTA 6]. La cuenta puede tener más juegos/saldo/regalos/etc. Formato: login:pass. Fresh, checked y UHQ. Al abrir ticket te lo enviaremos.",
    badge: "Pro"
  }
];

const grid = document.getElementById("productGrid");
const cartCount = document.getElementById("cartCount");
const cartPanel = document.getElementById("cartPanel");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const overlay = document.getElementById("overlay");
const heroAddButton = document.querySelector(".hero-card .mini");
const cartButton = document.getElementById("openCart");

const state = {
  cart: JSON.parse(localStorage.getItem("optistore-cart")) || {},
  category: "all",
  search: "",
  sort: "featured"
};

function saveCart() {
  localStorage.setItem("optistore-cart", JSON.stringify(state.cart));
}

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function formatCategoryLabel(category) {
  if (category === "steam") return "Steam";
  return category;
}

function updateCartCount() {
  const total = Object.values(state.cart).reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = total;
}

function pulseCart() {
  if (!cartButton) return;
  cartButton.classList.remove("pulse");
  void cartButton.offsetWidth;
  cartButton.classList.add("pulse");
}

function markAdded(button) {
  if (!button) return;
  const original = button.textContent;
  button.textContent = "Añadido";
  button.classList.add("btn-added");
  setTimeout(() => {
    button.textContent = original;
    button.classList.remove("btn-added");
  }, 900);
}

function renderProducts() {
  let filtered = products.filter((product) => {
    const matchCategory = state.category === "all" || product.category === state.category;
    const matchSearch =
      product.name.toLowerCase().includes(state.search) ||
      product.description.toLowerCase().includes(state.search);
    return matchCategory && matchSearch;
  });

  if (state.sort === "price-asc") {
    filtered = filtered.sort((a, b) => a.price - b.price);
  }
  if (state.sort === "price-desc") {
    filtered = filtered.sort((a, b) => b.price - a.price);
  }

  grid.innerHTML = filtered
    .map(
      (product) => `
      <article class="product-card">
        <span class="badge">${product.badge}</span>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-meta">
          <span>${formatPrice(product.price)}</span>
          <span>${formatCategoryLabel(product.category)}</span>
        </div>
        <button type="button" data-id="${product.id}">Añadir al carrito</button>
      </article>
    `
    )
    .join("");
}

function renderCart() {
  const items = Object.values(state.cart);

  if (items.length === 0) {
    cartItems.innerHTML = "<p>Tu carrito está vacío. Elige algo.</p>";
    cartTotal.textContent = "$0.00";
    updateCartCount();
    return;
  }

  cartItems.innerHTML = items
    .map(
      (item) => `
      <div class="cart-item">
        <div>
          <h4>${item.name}</h4>
          <span>${formatPrice(item.price)}</span>
        </div>
        <div class="qty">
          <button data-action="decrease" data-id="${item.id}">-</button>
          <span>${item.qty}</span>
          <button data-action="increase" data-id="${item.id}">+</button>
        </div>
      </div>
    `
    )
    .join("");

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotal.textContent = formatPrice(total);
  updateCartCount();
}

function addToCart(id, button) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  if (!state.cart[id]) {
    state.cart[id] = { ...product, qty: 1 };
  } else {
    state.cart[id].qty += 1;
  }

  saveCart();
  renderCart();
  pulseCart();
  markAdded(button);
}

function updateQty(id, delta) {
  if (!state.cart[id]) return;
  state.cart[id].qty += delta;
  if (state.cart[id].qty <= 0) {
    delete state.cart[id];
  }
  saveCart();
  renderCart();
}

function toggleCart(open) {
  cartPanel.classList.toggle("open", open);
  overlay.classList.toggle("show", open);
  cartPanel.setAttribute("aria-hidden", (!open).toString());
}

renderProducts();
renderCart();
updateCartCount();

// Events

document.getElementById("categorySelect").addEventListener("change", (event) => {
  state.category = event.target.value;
  renderProducts();
});

document.getElementById("searchInput").addEventListener("input", (event) => {
  state.search = event.target.value.toLowerCase();
  renderProducts();
});

document.getElementById("sortSelect").addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

if (heroAddButton) {
  heroAddButton.addEventListener("click", (event) => {
    const id = Number(event.currentTarget.dataset.id);
    addToCart(id, event.currentTarget);
    toggleCart(true);
  });
}

grid.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = Number(button.dataset.id);
  addToCart(id, button);
  toggleCart(true);
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  if (action === "increase") updateQty(id, 1);
  if (action === "decrease") updateQty(id, -1);
});

document.getElementById("openCart").addEventListener("click", () => toggleCart(true));

document.getElementById("closeCart").addEventListener("click", () => toggleCart(false));

overlay.addEventListener("click", () => {
  toggleCart(false);
  toggleCheckout(false);
});

const checkoutPanel = document.getElementById("checkoutPanel");
const checkoutCode = document.getElementById("checkoutCode");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutItems = document.getElementById("checkoutItems");
const checkoutOrderId = document.getElementById("checkoutOrderId");
const checkoutRef = document.getElementById("checkoutRef");
const copyTicketButton = document.getElementById("copyTicket");
const closeCheckout = document.getElementById("closeCheckout");

function toggleCheckout(open) {
  checkoutPanel.classList.toggle("open", open);
  overlay.classList.toggle("show", open);
  checkoutPanel.setAttribute("aria-hidden", (!open).toString());
}

document.getElementById("checkoutBtn").addEventListener("click", () => {
  const items = Object.values(state.cart);
  if (items.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }
  const order = buildOrder(items);
  renderCheckout(order);
  toggleCheckout(true);
});

closeCheckout.addEventListener("click", () => toggleCheckout(false));

function buildOrder(items) {
  const orderId = `OPTI-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const code = `CODE-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const ref = makeRef(orderId, total, items);
  const createdAt = new Date().toISOString();
  return { orderId, code, total, ref, items, createdAt };
}

function makeRef(orderId, total, items) {
  const base = `${orderId}|${total}|${items.map((i) => `${i.id}x${i.qty}`).join(",")}`;
  let hash = 0;
  for (let i = 0; i < base.length; i += 1) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase().slice(0, 6);
}

function renderCheckout(order) {
  checkoutCode.textContent = order.code;
  checkoutTotal.textContent = formatPrice(order.total);
  checkoutOrderId.textContent = order.orderId;
  checkoutRef.textContent = order.ref;
  checkoutItems.innerHTML = order.items
    .map(
      (item) => `
      <div class="checkout-item">
        <span>${item.name} x${item.qty}</span>
        <span>${formatPrice(item.price * item.qty)}</span>
      </div>
    `
    )
    .join("");
  localStorage.setItem("optistore-last-order", JSON.stringify(order));
}

function buildTicketText() {
  const raw = localStorage.getItem("optistore-last-order");
  if (!raw) return "";
  const order = JSON.parse(raw);
  const lines = order.items.map(
    (item) => `- ${item.name} x${item.qty} (${formatPrice(item.price * item.qty)})`
  );
  return [
    `Pedido: ${order.orderId}`,
    `Codigo: ${order.code}`,
    `Ref: ${order.ref}`,
    `Total: ${formatPrice(order.total)}`,
    "Items:",
    ...lines
  ].join("\n");
}

if (copyTicketButton) {
  copyTicketButton.addEventListener("click", async () => {
    const text = buildTicketText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyTicketButton.textContent = "Copiado";
      setTimeout(() => {
        copyTicketButton.textContent = "Copiar ticket";
      }, 1000);
    } catch {
      alert("No se pudo copiar.");
    }
  });
}
