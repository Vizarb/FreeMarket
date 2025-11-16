
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



**MUST HAVE**
Here’s a 12-week, six-sprint roadmap that fills in your missing “must-have” features and layers in Redis support at the right times. You can stretch or compress to match your team’s cadence:

---

## 📅 Roadmap Overview

| Sprint |    Weeks    | Focus Areas                                                   |
| :----: | :---------: | :------------------------------------------------------------ |
|    1   |  Weeks 1–2  | Redis infra & Guest Checkout + Address Book UI                |
|    2   |  Weeks 3–4  | Payment Gateway Integration + Redis caching for payments      |
|    3   |  Weeks 5–6  | Order History & Tracking UI + Notifications (Redis Pub/Sub)   |
|    4   |  Weeks 7–8  | Reviews & Ratings + Redis caching of hot data                 |
|    5   |  Weeks 9–10 | Returns/Refunds Workflow + Admin/Seller Analytics Dashboard   |
|    6   | Weeks 11–12 | In-App Chat & Support Tickets (Redis Streams) + Accessibility |

---

### 🚧 Sprint 1: Redis Infra & Guest Checkout / Address Book

**Goals**

* Stand up a Redis cluster (Dev/Staging/Prod) for session storage and caching.
* Implement guest-checkout flow (cart persisted in Redis for anonymous users).
* Build “Address Book” UI: add/edit/select multiple shipping addresses.

**Redis Tasks**

* Configure Django/DRF to use Redis for session backend.
* Hook your cart slice (frontend) to read/write anonymous cart from Redis.
* Add a Redis key-expiry policy to purge old guest carts.

**Deliverables**

* Redis deployed and connected (cache and session backends).
* Endpoints & React components for guest cart + address management.
* E2E tests covering guest flow → account merge.

---

### 🚀 Sprint 2: Payment Gateway Integration + Redis Caching

**Goals**

* Integrate Stripe (or PayPal) for live payment flows (including saved cards).
* Ensure PCI-DSS compliance (tokenization, SSL/TLS).

**Redis Tasks**

* Cache in-flight payment sessions in Redis (idempotency & retries).
* Store short-lived locks in Redis to prevent double-charges.

**Deliverables**

* Front-end checkout form wired to Stripe Elements or PayPal SDK.
* Back-end endpoints to create/confirm payments, webhook handlers.
* Automated tests for retry scenarios and idempotency.

---

### 📦 Sprint 3: Order History & Tracking + Notifications

**Goals**

* Build “Order History” page showing status timeline (Pending → Shipped → Delivered).
* Wire up email (and optionally SMS) on status changes.

**Redis Tasks**

* Use Redis Pub/Sub to broadcast order-status changes to:

  1. Notification service
  2. In-app bell-icon component

**Deliverables**

* React `<OrderHistory>` with a stepper showing timestamps.
* Notification dropdown in the header, unread-count badge.
* Background worker subscribing to Redis channel and dispatching emails/SMS.

---

### ⭐ Sprint 4: Reviews & Ratings + Data Caching

**Goals**

* Create `Review` model/viewset (1–5 stars + text).
* Add front-end components for submitting & displaying reviews.

**Redis Tasks**

* Cache top-reviewed items and average ratings in Redis for fast reads.
* Invalidate cache on new review submissions.

**Deliverables**

* API endpoints: `POST /reviews/`, `GET /items/{id}/reviews`.
* `<ReviewForm>` and `<ReviewList>` components.
* Unit tests for cache invalidation and rating calculations.

---

### 📊 Sprint 5: Returns/Refunds Workflow & Analytics

**Goals**

* Implement returns/refunds:

  * Buyer can request return within 30 days.
  * Seller/Admin approve or reject via UI.
* Build a basic Analytics dashboard for sellers: sales over time, top products.

**Redis Tasks**

* Use Redis sorted-sets to maintain rolling daily sales totals for quick charting.
* Cache dashboard queries, expire hourly.

**Deliverables**

* Return-request endpoints + React modals/forms for buyers/sellers.
* `<SellerAnalytics>` page with charts (connect to cached metrics).
* End-to-end tests for return lifecycle and analytics accuracy.

---

### 💬 Sprint 6: In-App Chat & Accessibility Audit

**Goals**

* Stand up buyer-seller chat:

  * `Conversation` & `Message` models.
  * Real-time via Redis Streams (or Pub/Sub).
* Conduct a full WCAG AA audit and remediate: keyboard nav, ARIA roles, color contrast.

**Redis Tasks**

* Use Redis Streams for message queues and offline message buffering.
* Optionally cache recent chat history in Redis for fast fetch.

**Deliverables**

* `<ChatWindow>` & `<ConversationList>` components with unread-badge integration.
* Accessibility report and a prioritized backlog of ARIA and contrast fixes.
* Regression tests: keyboard-only navigation, screen-reader smoke tests.

---

**Cross-Sprint Considerations**

* **Testing**: add Redis-mock support for CI.
* **Security**: ensure all new endpoints enforce auth/permissions.
* **Docs**: update architecture diagram to include Redis, and document new flows in your Roadmap.md.
* **Monitoring**: add metrics on Redis hit/miss rates and queue latencies.

This sequence builds the non-negotiable e-comm essentials first, while progressively leveraging Redis for performance, reliability, and real-time features. Let me know if you’d like to adjust scope or timing!
