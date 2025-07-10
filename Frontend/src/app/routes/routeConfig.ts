// src/app/routes/routeConfig.ts

import HomePage from "@/components/pages/HomePage";
import SellerDashboard from "@/features/seller/SellerDashboard";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import TestEnvPage from "@/components/pages/TestEnvPage";
import CheckoutPage from "@/features/order/CheckoutPage";
import OrderHistory from "@/features/order/OrderHistory";
import CartPage from "@/features/cart/CartPage";
import MarketplacePage from "@/components/pages/MarketplacePage";
import ForbiddenPage from "@/components/pages/ForbiddenPage";
import OrderConfirmation from "@/features/order/OrderConfirmation";
import ItemDetailPage from "@/features/item/ItemDetailPage";
import SearchResultsPage from "@/components/common/SearchResultsPage";
import BecomeSellerForm from "@/components/forms/BecomeSellerForm";
import AdminSellerApplicationsPage from "@/features/user/AdminSellerApplicationsPage";
import SellerShopPage from "@/features/seller/SellerShopPage";
import NewItemPage from "@/components/pages/NewItemPage";

// === Shared Route Type ===
export interface AppRoute {
  path: string;
  name: string;
  component: React.FC;
}

export interface RoleProtectedRoute extends AppRoute {
  roles: string[];
}

// === Public Routes (No auth, No layout) ===
export const publicRoutes: AppRoute[] = [
  { path: "/", name: "Home", component: HomePage },
  { path: "/login", name: "Login", component: LoginPage },
  { path: "/register", name: "Register", component: RegisterPage },
  { path: "/test-env", name: "Test Env", component: TestEnvPage },
  { path: "/403", name: 'Forbidden', component: ForbiddenPage },
  { path: "/marketplace", name: "Marketplace", component: MarketplacePage },
  { path: "/shop/:slug", name: "Seller Shop", component: SellerShopPage },
];

// === Role-Based Routes (All authenticated users have at least a role) ===
export const roleBasedRoutes: RoleProtectedRoute[] = [
  { path: "/cart", name: "Cart", component: CartPage, roles: ["Buyer", "Admin"] },
  { path: "/checkout", name: "Checkout", component: CheckoutPage, roles: ["Buyer", "Admin"] },
  { path: "/orders", name: "Order History", component: OrderHistory, roles: ["Buyer", "Admin"] },
  { path: "/order-confirmation", name: "Order Confirmation", component: OrderConfirmation, roles: ["Buyer", "Admin"] },
  { path: "/seller-dashboard", name: "Seller Dashboard", component: SellerDashboard, roles: ["Seller", "Admin"] },
  { path: "/seller-dashboard/items/new", name: "Item Creation", component: NewItemPage, roles: ["Seller", "Admin"] },
  { path: "/items/:slug",name: "Item Detail", component: ItemDetailPage, roles: ["Buyer", "Admin", "Seller"] },
  { path: "/search", name: "Search Results", component: SearchResultsPage, roles: ["Buyer", "Admin", "Seller"] },
  { path: "/become-seller", name: "Become Seller", component: BecomeSellerForm, roles: ["Buyer", "Admin"] },
  { path: "/admin/seller-applications", name: "Review Seller Applications", component: AdminSellerApplicationsPage, roles: ["Admin"] },
];
