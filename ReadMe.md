
# 🛒 FreeMarket

![Conventional Commits](https://img.shields.io/badge/commits-conventional-yellow.svg)
![Build](https://img.shields.io/github/actions/workflow/status/vizarb/FreeMarket/ci.yml?branch=main)
![Last Commit](https://img.shields.io/github/last-commit/vizarb/FreeMarket)
![Latest Tag](https://img.shields.io/github/v/tag/vizarb/FreeMarket?label=latest%20release)
![Coverage](https://codecov.io/gh/vizarb/FreeMarket/branch/main/graph/badge.svg)
![License: All Rights Reserved](https://img.shields.io/badge/license-All%20Rights%20Reserved-red)

**FreeMarket** is a full-stack, AI-enhanced online marketplace built with a modular and scalable architecture. It supports both **products** and **services**, and replicates the vibrancy of a street market with the reliability of a digital storefront.

Designed for modern web standards, FreeMarket integrates advanced search, real-time features, structured APIs, and role-aware user management to support both individual sellers and large-scale vendors.

---

## 🎯 Core Features

### Unified Marketplace
- **Sell Anything**: Supports both tangible **Products** and scheduled **Services** under a unified item model.
- **Category Trees**: Nestable categories with full-path filtering like `Electronics > Laptops > Gaming`.
- **Full-Text Search**: PostgreSQL-powered fuzzy matching with GIN indexes and ILIKE fallback.
- **Autocomplete**: Fast live suggestions while typing.
- **AI-Powered Suggestions** *(roadmap)*: ML models for product/service recommendations.

### User & Order Management
- **Custom Auth**: Extended Django `AbstractUser` with roles, phone number, gender, and birth date.
- **Cart-to-Order Flow**: Cart syncing with bulk order creation and pricing snapshots.
- **Soft Deletion**: Restore deleted items or orders.
- **Role-Based Logging**: Structured user activity logging via decorators.

### Real-Time & UX
- **Responsive UI**: Built in React 18 with Tailwind-compatible layouting.
- **Dynamic Filters**: Category, price, and service-type filtering with pagination.
- **Add to Cart**: Unified interface for products/services with contextual handling.

---

## ⚙️ Tech Stack & Versions

| Layer        | Tech                            | Version              |
|--------------|----------------------------------|----------------------|
| **Frontend** | React                            | 18.2.0               |
|              | Redux Toolkit                    | 1.9.x                |
|              | TypeScript                       | 5.x                  |
|              | Axios                            | 1.6.x                |
| **Backend**  | Django                           | 4.2.x                |
|              | Django REST Framework            | 3.14.x               |
|              | PostgreSQL Full-Text Search (FTS)| GIN index + fallback |
| **Database** | PostgreSQL                       | 15.x                 |
| **Caching**  | Redis                            | 7.x                  |
| **DevOps**   | Docker                           | 24.x                 |
|              | Docker Compose                   | 2.x                  |
|              | GitHub Actions                   | CI/CD enabled        |

---

## 📦 Project Structure

```

frontend/
│   ├── components/
│   ├── features/ (item, cart, auth, order)
│   └── pages/ (LoginPage, MarketplacePage, CartPage)
backend/
│   ├── base/ (models, views, serializers)
│   ├── utils/ (category, logging)
│   └── api/ (REST endpoints + viewsets)

````

---

## 🧪 Quick Start

### 🔧 Docker

```bash
git clone https://github.com/vizarb/freemarket.git
cd freemarket
docker-compose up
````

App runs at `http://localhost:8000`.

---

### 👨‍💻 Manual Setup (Dev)

#### Backend

```bash
cd backend
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Frontend

```bash
cd frontend
yarn install
yarn dev
```

---

## 🔐 Configuration

* Setup `.env` files in both `frontend/` and `backend/` for keys like:

  * `POSTGRES_DB`, `REDIS_URL`, `DJANGO_SECRET_KEY`
* Redis must be running for sessions and logging.
* Seed logic supports rebuilding FTS columns on init.

---

## 🗺 Roadmap

* [x] MVP: Cart, Order, Product/Service creation
* [x] Full-Text Search + Autocomplete
* [x] Nested Category Filtering
* [ ] Real-Time Chat & Notifications (planned)
* [ ] AI-Powered Recommendations (planned)
* [ ] Admin Dashboard & Analytics

---

## 🔧 Git Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for consistency and automation.

### ✅ Commit Format

```
<type>(scope): message
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`

Examples:

* `feat(cart): add remove-from-cart button`
* `fix(auth): token not refreshing correctly`
* `TAG release v0.3.0` – triggers automated tagging

### 🔀 Branch Naming

| Branch Type | Example                              |
| ----------- | ------------------------------------ |
| Feature     | `feature/item-search`                |
| Bugfix      | `bugfix/order-cancel-bug`            |
| Refactor    | `refactor/user-model`                |
| Chore/Test  | `chore/ci-pipeline`, `test/cart-api` |

---

## 📬 Contributing

1. Fork this repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit with proper format
4. Open a Pull Request

### 🔒 Enforce Commit Style

Install this Git hook to prevent bad commit messages:

```bash
cp hooks/commit-msg .git/hooks/commit-msg
chmod +x .git/hooks/commit-msg

cp hooks/prepare-commit-msg .git/hooks/prepare-commit-msg
chmod +x .git/hooks/prepare-commit-msg

```

---

## 🪪 License

This project is **not open source**. The code is published for educational and personal portfolio use only.

You may **not** copy, reuse, redistribute, or republish any part of this project without the author’s express permission.

See [`LICENSE`](./LICENSE) for full terms.


---

## 👤 Contact

* **Author**: Barr Ziv
* **GitHub**: [@vizarb](https://github.com/vizarb)
* **Email**: [zivbarr47@gmail.com](mailto:zivbarr47@gmail.com)
* **LinkedIn**: [Barr Ziv](https://www.linkedin.com/in/barr-ziv-b63a82219/)
