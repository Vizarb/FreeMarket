
---

# 🗺️ FreeMarket Roadmap

This roadmap reflects the evolution of **FreeMarket** from a clean MVP to a full-featured, scalable marketplace with real-time systems, AI features, and backend-first polish. It’s built to demonstrate professional-level engineering and architectural depth.

---

## ✅ Phase 1: Core MVP (Complete)

🎯 Goal: Build a minimal, working e-commerce platform with real data and auth flow.

* [x] Custom `User` model with roles (Buyer, Seller, Admin)
* [x] JWT login & protected API routes
* [x] Products & Services with polymorphic `Item` base
* [x] Categories with nested filtering and full paths
* [x] Cart with soft-delete + restore
* [x] Order creation with price snapshot
* [x] Seller dashboard (CRUD)
* [x] Item search with FTS + autocomplete
* [x] PostgreSQL views (`ItemDetails`, `CartOverview`, `OrderDetails`, etc.)
* [x] Vercel + Render deployment (frontend/backend)
* [x] .env configuration for local Docker dev

---

## 🔧 Phase 2: Polish & Platform Stability (In Progress)

🎯 Goal: Harden the stack, improve UX, and make it CI/CD ready.

### Backend

* [x] BaseViewSet abstraction for DRY CRUD logic
* [x] Soft delete & restore for all key models
* [x] Logging decorator for user actions
* [ ] Email/password reset + verification flow
* [x] Test coverage using `pytest-django`
* [x] GitHub Actions for tests, lint, coverage, tagging
* [ ] Admin dashboard to manage users/sellers

### Frontend

* [x] Global error handling with Axios interceptors
* [x] Toast notifications
* [x] Dark mode + theme toggle
* [x] Marketplace filters (price, currency, category, type)
* [x] Order history page
* [x] Improved mobile experience
* [x] Form validation tied to Django model rules

---

## 🔄 Phase 3: Real-Time, Redis, and Materialized Views

🎯 Goal: Enable performance, live UX, and data-driven features.

### Redis-powered Features

* [ ] Redis integration (via Docker)
* [ ] Redis Pub/Sub channel layer
* [ ] Live chat between buyer & seller (prototype)
* [ ] Real-time notifications (new order, offer, etc.)
* [ ] Rate limiting or login/session protection

### PostgreSQL Enhancements

* [x] Read-optimized views
* [ ] Materialized views for analytics
* [ ] Periodic refresh jobs (e.g. top sellers weekly)

---

## 🧠 Phase 4: AI & Personalization

🎯 Goal: Add intelligent behavior and data-driven UX.

* [ ] Simple rule-based recommendation engine (e.g. “You might also like…”)
* [ ] AI search refinement (vector search or keyword boosting)
* [ ] Offer system: buyers can propose prices
* [ ] Negotiation interface (seller counter-offer)
* [ ] Smart category suggestion when posting items
* [ ] Personalized homepage based on user behavior

---

## 💳 Phase 5: Monetization & Extensibility

🎯 Goal: Showcase business-readiness and multi-vendor architecture.

* [ ] Multi-vendor storefronts with vanity URLs
* [ ] Gift card logic with balance tracking
* [ ] Subscription plans (mocked Stripe or PayPal)
* [ ] Seller analytics page
* [ ] Admin promotions/featured items system

---

## 🔚 Phase 6: Final Polish & Release

🎯 Goal: Deliver a professional-grade, portfolio-worthy app.

* [ ] 90–100% code coverage on backend
* [x] Full README + tech doc + Swagger schema
* [x] Production Dockerfile + CI deployment
* [x] GitHub profile + personal site linking to project
* [ ] Code walkthrough blog post or demo video

---

