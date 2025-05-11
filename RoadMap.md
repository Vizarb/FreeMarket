# 🗺️ FreeMarket Roadmap (2025 Edition)

## 🚀 Phase 1: MVP Core (Must-Haves)
🎯 Goal: Launch the basics, cleanly. Focus on backend strength, database logic, and clean API design.

### ✅ Backend
- [x] Custom user model
- [x] JWT auth (access + refresh)
- [x] Products/Services with categories
- [x] Orders + OrderItems
- [x] PostgreSQL views + triggers + stored procedures
- [x] Basic API tests (pytest or Django built-in)

### ✅ Frontend
- [x] Sign up / login flow
- [x] Browse products
- [x] Add to cart (Redux slice)
- [x] View cart + checkout (triggers order)
- [ ] Basic order history

### ✅ Infra
- [x] Docker for dev
- [ ] GitHub Actions for sanity checks (DB, lint, test)
- [ ] Redis for session/token management or rate limiting

> 💡 Deliverable: Working backend-heavy MVP. Focus on clean APIs and DB logic.

---

## ✨ Phase 2: MVP Polish & Developer Quality
🎯 Goal: Make it testable, secure, and dev-friendly. Great for resume + GitHub.

### ✅ Backend
- [ ] Email verification / password reset
- [ ] Rate limiting (Redis-based)
- [ ] Token blacklisting / logout
- [ ] Caching expensive views with Redis

### ✅ Frontend
- [ ] Improved UI (Tailwind + component library)
- [ ] React toast notifications (errors, success)
- [ ] Error handling with Axios interceptors
- [ ] Refresh token flow on expiry

### ✅ Infra
- [ ] GitHub Actions CI with lint + tests
- [ ] Docker Compose with Redis/Postgres/Celery

> 💡 Deliverable: A clean, secure MVP with modern tooling and good DX.

---

## 🧠 Phase 3: Smart Features & Real-World Feel
🎯 Goal: Showcase advanced backend, clean frontend, and real business logic.

### ✅ Backend
- [ ] Wishlist or saved items
- [ ] Stock management (trigger-based)
- [ ] Advanced filtering/sorting/pagination
- [ ] Business logic in stored procs/views

### ✅ Frontend
- [ ] Product filters (price, category, etc.)
- [ ] Sort by price, popularity
- [ ] Seller dashboard (CRUD products)
- [ ] User order dashboard

### ✅ Redis Enhancements
- [ ] Pub/Sub for seller notifications
- [ ] Email/OTP via Redis + Celery
- [ ] Chat system prototype (Redis Pub/Sub + WebSocket)

> 💡 Deliverable: A feature-rich app with intelligent architecture.

---

## 🚀 Phase 4: Advanced Features (For fun + learning)
🎯 Goal: Build impressive, uncommon features to make your project stand out.

- [ ] Real-time chat (Redis Pub/Sub + WebSocket)
- [ ] Admin dashboard (CRUD on all models)
- [ ] Recommender system ("You may also like...")
- [ ] AI-powered search (basic keyword/vector matching)
- [ ] Multi-vendor support (sellers manage their own inventory)
- [ ] Payment integration mock (Stripe sandbox or simulated logic)

> 💡 Deliverable: A unique, powerful resume project that demonstrates initiative and creativity.

---

## 🛠️ Tips
- Use `#backend`, `#frontend`, `#infra`, `#redis` tags in Notion if using as a Kanban board
- Link each task to a GitHub issue or PR if working in a repo
- Prioritize features that align with your job goals (e.g. backend engineering, DevOps, etc.)
- Don’t overbuild. Done > Perfect.
