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
        <button data-id="${product.id}">Añadir al carrito</button>
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

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  if (!state.cart[id]) {
    state.cart[id] = { ...product, qty: 1 };
  } else {
    state.cart[id].qty += 1;
  }

  saveCart();
  renderCart();
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

grid.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = Number(button.dataset.id);
  addToCart(id);
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
  const code = `OPTI-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  checkoutCode.textContent = code;
  checkoutTotal.textContent = formatPrice(total);
  toggleCheckout(true);
});

closeCheckout.addEventListener("click", () => toggleCheckout(false));
