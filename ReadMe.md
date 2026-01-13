# 🛒 FreeMarket

![Conventional Commits](https://img.shields.io/badge/commits-conventional-yellow.svg)
![Build](https://img.shields.io/github/actions/workflow/status/vizarb/FreeMarket/ci.yml?branch=main)
![Last Commit](https://img.shields.io/github/last-commit/vizarb/FreeMarket)
![Coverage](https://codecov.io/gh/vizarb/FreeMarket/branch/main/graph/badge.svg)
![License: All Rights Reserved](https://img.shields.io/badge/license-All%20Rights%20Reserved-red)
[![Roadmap](https://img.shields.io/badge/docs-roadmap-blue)](./ROADMAP.md)
[![Tech Doc](https://img.shields.io/badge/docs-tech--spec-green)](./TECH_DOC.md)

---

**FreeMarket** is a full-stack, modern, scalable e-commerce platform where users can buy and sell both physical products and digital services. Inspired by street markets and shaped by platform architecture, it balances performance, flexibility, and clean design — and is actively being developed.

---

## 🎯 Purpose

This project serves as a professional portfolio to:

* Demonstrate end-to-end system design in a modern tech stack
* Practice scalable backend architecture (views, triggers, Redis, AI, etc.)
* Build and polish a real-world, testable product ready for extensions

---

## 🧰 Tech Stack

### Frontend

* React 19, TypeScript 5.7, Vite 6.3
* Redux Toolkit, Axios, Tailwind CSS, ShadCN UI
* Hosted on Vercel

### Backend

* Python 3.12, Django 5.1.4, DRF 3.15.2
* PostgreSQL 15
* `drf-spectacular` for OpenAPI schema generation
* Dockerized, deployed on Render

### DevOps

* Docker + Docker Compose
* GitHub Actions CI/CD
* Codecov coverage tracking
* Redis (planned): pub/sub, caching, Celery queues

📄 Full Tech Doc: [TECH_DOC.md](./TECH_DOC.md)

---

## 🛂 Authentication & Roles

* Secure login/logout with JWT
* Role-based access control: Buyer / Seller / Admin
* Seller application workflow
* Admin dashboard for seller and user management

---

## 🏪 Marketplace Features

### 🔍 Search & Filtering

* Full-text search (PostgreSQL GIN + fallback)
* Autocomplete suggestions
* Filter by type, category, price, and currency

### 🧾 Cart & Orders

* Cart with add/remove/update logic
* Soft delete logic + item recovery
* Checkout triggers atomic order creation
* Order snapshot locking prices

### 👤 Seller Dashboard

* Add/edit/remove (soft-delete) items
* View and manage live listings
* Public-facing shop view for each seller

### 📈 Admin Capabilities

* View top sellers and products
* Approve/reject seller applications
* View order and cart stats via PostgreSQL views

---

## 🔢 Database Architecture

* Multi-table model inheritance (`Item → Product | Service`)
* Soft-delete via `BaseModel`
* PostgreSQL views: `ItemDetails`, `UserOrderHistory`, `CartOverview`, `TopSellingProducts`
* Indexed search vector (`SearchVectorField`)
* Planned: materialized views and scheduled refresh

---

## 🏗 Project Structure

```
FreeMarket/
├── frontend/            # React app
│   ├── components/      # SearchBar, Filters, ItemCard, etc.
│   ├── features/        # Redux slices for cart, auth, search
│   └── pages/           # MarketplacePage, CartPage, etc.
│
├── backend/             # Django app
│   ├── base/            # Core models, serializers, views
│   ├── utils/           # Logging decorators, FTS utilities
│   ├── management/      # Custom Django commands
│   └── settings/        # Environment-specific config
```

---

## 🧪 Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/Vizarb/FreeMarket.git
cd FreeMarket
```

### 2. Setup Environment

```bash
cp .env.example .env
```

### 3. Start with Docker Compose

```bash
docker compose up --build
```

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:8000/api/](http://localhost:8000/api/)
* Swagger: [http://localhost:8000/api/schema/swagger-ui/](http://localhost:8000/api/schema/swagger-ui/)

### 4. Migrate & Seed (optional)

```bash
docker compose exec backend python manage.py migrate
# Optional seed
docker compose exec backend python manage.py seed
```

---

## 🧭 Roadmap Preview

✅ Core MVP Complete:

* Auth, roles, cart, orders, seller dashboard, views

🔜 In Progress:

* Admin dashboard
* Order history view
* Materialized views
* Full Redis integration (chat, notifications)
* AI recommendations + personalization
* Offer/negotiation system

📄 Full roadmap: [ROADMAP.md](./ROADMAP.md)

---

## 🧱 Architecture Highlights

* Monorepo with clean frontend/backend separation
* PostgreSQL views for optimized reads
* Django REST Framework with viewsets, serializers
* Scalable model hierarchy (Item → Product/Service)
* Soft deletes with restore capability
* CI/CD and local parity via Docker
* Future Redis Channel Layer for:

  * Real-time chat (WebSockets)
  * Async tasks (Celery/Django-Q)
  * Rate limiting & token management

---

## 🤝 Contributing

This is a solo project built for portfolio/demo purposes.

You’re welcome to:

* Explore the code
* Open issues
* Suggest improvements

If collaboration is opened in the future, contribution guidelines will be added.

---

## 👤 About the Author

Hi! I’m **Bar Ziv** (also known as Vizarb) — a full-stack developer with a solid foundation in QA engineering and a passion for backend systems, databases, and scalable architecture.

Before becoming a developer, I worked for several years as a **QA engineer**, combining **manual and automated testing** (Python, Selenium) to ensure product reliability and edge-case coverage. That experience sharpened my attention to detail, test-first mindset, and understanding of how real-world systems break.

I completed a professional full-stack development program at **John Bryce**, where I trained in modern web technologies including **Django**, **React**, **PostgreSQL**, **Docker**, and **TypeScript**. Since then, I’ve been building real-world projects like **FreeMarket** — a production-ready marketplace platform — to deepen my skills and demonstrate what I can build independently.

### 💻 What I Focus On

* **Backend architecture**: PostgreSQL, Django REST Framework, Redis, Docker
* **Frontend UX**: Clean, responsive UIs with React, Vite, Tailwind CSS
* **Testing & DevOps**: Pytest, GitHub Actions, Docker Compose, CI/CD best practices

### 🌍 Let’s Connect

* 📫 Email: [zivbarr47@gmail.com](mailto:zivbarr47@gmail.com)
* 💼 LinkedIn: [Barr Ziv](https://www.linkedin.com/in/barr-ziv-b63a82219/)
* 💻 GitHub: [@vizarb](https://github.com/vizarb)

> I’m always open to opportunities, feedback, and conversations about backend development, full-stack systems, or QA-informed design.

---

## 📜 License

This project is **All Rights Reserved**.
Code may not be reused, republished, or distributed without written permission.

---

*Thank you for exploring **FreeMarket**!*
