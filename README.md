# 🧪 Scent Map — Fragrance Discovery Log

**Scent Map** is a lightweight Single-Page Application (SPA) designed for perfume and fragrance enthusiasts to catalog, discover, and organize their personal fragrance collection.

---

## ✨ Features

- **Collection Summary:** Real-time metrics for total logged fragrances, owned bottles, and wishlist items.
- **Real-Time Search & Filtering:** Filter catalog instantly by scent family (*Floral, Woody, Citrus, Oriental, Fresh, Spicy, etc.*) or status tag (*Tried, Own It, Want It*).
- **Interactive Scent Grid:** Color-coded badges for scent families and nose ratings (1–5 👃). Click any family badge on a card to quick-filter!
- **Complete CRUD & Quick Actions:** Add, edit, delete, or quick-toggle item status directly from the inline detail panel.
- **Data Persistence & Seed Data:** Automatic `localStorage` sync with fallback sample data and full collection restore options.
- **Accessibility & Edge-Case Ready:** Custom empty-state displays, keyboard navigation (`Enter` to open detail, `Esc` to close modals), and XSS-sanitized inputs.

---

## 🛠️ Built With

- **HTML5** (Semantic Markup)
- **CSS3** (Responsive Grid & Custom CSS Variables)
- **JavaScript (ES6+)** (Vanilla JS with Zero External Dependencies)

---

## 🚀 Getting Started

No installation, build tools, or `node_modules` required.

1. Clone or download this repository.
2. Open `index.html` in any modern web browser, or launch using VS Code **Live Server** extension.

---

## 📂 Project Structure

```text
.
├── index.html   # Application structure & modal layouts
├── styles.css   # Luxury boutique typography & responsive layout
├── app.js       # Core state management, CRUD logic & LocalStorage handler
└── README.md    # Project documentation