
---

# 🧠 FreeMarket – Technical Overview

This document outlines the architectural design, tools, and decisions behind **FreeMarket**, a full-stack portfolio project built to demonstrate real-world backend engineering, frontend modularity, and scalable system thinking.

> ✅ Updated according to the current deployed and local state.
> 🔗 See [README](./README.md) and [ROADMAP](./ROADMAP.md) for full context.

---

## 📦 Project Goals

* Build a modular, extensible e-commerce platform for **products and services**
* Practice PostgreSQL features like **views**, **FTS**, and soft deletes
* Showcase scalable **backend-first** design
* Prepare the project for **real-time UX** and **AI-powered personalization**

---

## 🏗️ Architecture Overview

### 📐 Structure

* **Monorepo layout**: `frontend/` and `backend/` live side-by-side
* **Backend-first approach**: frontend is shaped by the API and models
* **PostgreSQL views** for clean, read-optimized data consumption

---

## 🧰 Stack & Versions

### Frontend

| Tool/Library      | Version |
| ----------------- | ------- |
| React             | 19.0.0  |
| TypeScript        | 5.7.2   |
| Vite              | 6.3.3   |
| Redux Toolkit     | 2.7.0   |
| React Router      | 7.5.2   |
| Axios             | 1.9.0   |
| Tailwind CSS      | 4.1.4   |
| ShadCN UI (Radix) | 1.1.14+ |
| ESLint            | 9.22.0  |

**Hosted on**: Vercel

---

### Backend

| Tool/Library                   | Version |
| ------------------------------ | ------- |
| Python                         | 3.12.x  |
| Django                         | 5.1.4   |
| Django REST Framework          | 3.15.2  |
| drf-spectacular (OpenAPI)      | 0.28.0  |
| PostgreSQL                     | 15.x    |
| psycopg (native)               | 3.2.4   |
| django-cors-headers            | 4.6.0   |
| django-filter                  | 24.3    |
| django-environ                 | 0.11.2  |
| djangorestframework\_simplejwt | 5.4.0   |

**Deployed on**: Render

---

### DevOps / Infra

| Tool           | Version            |
| -------------- | ------------------ |
| Docker         | 24.x               |
| Docker Compose | 2.x                |
| GitHub Actions | Enabled            |
| Codecov        | Coverage reporting |
| Redis          | 7.x (planned)      |

---

## 🛂 Authentication & Roles

* **JWT-based auth** using access + refresh tokens
* Django `CustomUser` model with:

  * `phone_number`, `gender`, `date_of_birth`
  * Group-based role system: `Buyer`, `Seller`, `Admin`
* Protected routes + role-restricted views (admin, seller dashboard)

---

## 🛍 Core Features

### 🧾 Products & Services

* `Item` is the abstract parent of:

  * `Product` (with `quantity`)
  * `Service` (with `duration`, `type`)
* Category tree with `full_path` strings
* Admin + seller CRUD via viewsets

### 🛒 Cart & Orders

* Cart:

  * Add, update, remove
  * Soft-delete with restore
* Orders:

  * Atomic checkout
  * Locks item prices at time of purchase
  * Creates `OrderItems` with price snapshot
* Order status: `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`

---

## 🔍 Search & Filtering

* PostgreSQL **Full-Text Search (FTS)** using `SearchVectorField`
* GIN index + fallback to ILIKE
* Autocomplete endpoint with top 10 name matches
* Frontend filters by:

  * Type (`product` / `service`)
  * Price range
  * Category (recursive)
  * Currency

---

## 📊 PostgreSQL Views

| View                   | Use Case                            |
| ---------------------- | ----------------------------------- |
| `item_details`         | Unified listing of all items        |
| `cart_overview`        | Cart status with prices + item type |
| `user_order_history`   | Lightweight user-facing order list  |
| `order_details`        | Admin/full detail of orders         |
| `top_selling_products` | Future analytics view               |
| `most_active_users`    | Admin/statistical use               |

✅ All views are live
🛠 Planned: materialized versions for caching-heavy views

---

## 🔄 Redis (Planned Integration)

| Use Case      | Notes                                |
| ------------- | ------------------------------------ |
| Pub/Sub       | Live chat prototype                  |
| Notifications | Buyer/seller messages, offers        |
| Rate limiting | Login/session throttling             |
| Caching       | Hot category trees, view results     |
| Task queues   | Async emails, reminders (via Celery) |

---

## 🧪 Testing & CI/CD

* `pytest-django` based backend testing
* CI via GitHub Actions:

  * Linting (Black, Ruff, ESLint)
  * Tests + coverage report (Codecov)
  * Auto-tagging and Docker image builds
* High test coverage targeted for all key models and views

---

## 🚀 Deployment Details

* **Frontend**: [Vercel live site](https://free-market-theta.vercel.app/)
* **Backend**: Render (Docker image)
* **Dev**: Docker Compose

  * `frontend` on `localhost:5173`
  * `backend` API on `localhost:8000`
  * `postgres`, `redis` containers running locally

---

## 📁 Project Structure

```bash
FreeMarket/
├── frontend/
│   ├── components/      # UI: Header, Filters, ItemCard
│   ├── features/        # Redux slices for cart, items, auth
│   ├── pages/           # MarketplacePage, CartPage, LoginPage
│
├── backend/
│   ├── base/            # Models, serializers, views
│   ├── views/           # DB view models (ItemDetails, etc.)
│   ├── utils/           # Logging decorators, FTS helpers
│   ├── settings/        # Environment-specific config
│   ├── management/      # Custom seed commands
```

---

## 📌 Status

* ✅ Updated `README.md` to reflect actual current features and version numbers
* ✅ Roadmap broken down into 6 strategic phases
* ✅ GitHub CI/CD workflows enabled
* 🚧 Redis, chat, and AI features next

---