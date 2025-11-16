import React, { useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import {
  createOrderFromCart,
  selectOrderLoading,
  selectOrderError,
} from '../order/orderSlice';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useCartSummary } from '@/store/hooks/useCart';
import { selectCart } from './cartSlice';
import { selectAuthLoaded } from '../auth/authSlice';
import CartItemCard from './CartItemCard';
import DefaultHeader from '@/common/components/DefaultHeader';
import type { CartOverviewResponse } from '@/types/apiResponseType'; // <- add this


const imgFromItem = (item?: CartOverviewResponse): string => {
  if (!item) return '/placeholder.jpg';
  const raw = item.image_url ?? item.image ?? '';
  if (!raw) return '/placeholder.jpg';
  const isFull = /^https?:\/\//i.test(raw);
  const base = import.meta.env.VITE_BACKEND_URL ?? '';
  return isFull ? raw : `${base}${raw}`;
};

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const orderLoading = useAppSelector(selectOrderLoading);
  const orderError = useAppSelector(selectOrderError);
  const authLoaded = useAppSelector(selectAuthLoaded);

  // This is already CartOverviewResponse[] by selector type
  const items = useAppSelector(selectCart);

  const { itemCount, total } = useCartSummary();
  const { loading, error, addItem, decrementItem, reloadCart } = useCart();

  const hasReloaded = useRef(false);

  useEffect(() => {
    if (authLoaded && !hasReloaded.current) {
      reloadCart();
      hasReloaded.current = true;
    }
  }, [authLoaded, reloadCart]);

  const sortedItems = useMemo<CartOverviewResponse[]>(
    () => [...items].sort((a, b) => a.item_name.localeCompare(b.item_name)),
    [items]
  );


  const handleCheckout = async () => {
    const result = await dispatch(createOrderFromCart());
    if (createOrderFromCart.fulfilled.match(result)) {
      reloadCart();
      navigate('/order-confirmation', { state: { order: result.payload } });
    }
  };

  return (
    <>
      <DefaultHeader />
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Header row: flexible */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Your Cart</h2>
          <Link to="/marketplace" className="text-blue-600 hover:underline text-sm shrink-0">
            Continue shopping
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center mb-4">
            <p className="text-sm text-gray-400 italic animate-pulse">Refreshing cart...</p>
          </div>
        )}

        {error && <p className="text-red-600 text-center mt-4">Error: {error}</p>}
        {orderError && <p className="text-red-600 text-center mt-4">Error: {orderError}</p>}

        {/* Empty state card */}
        {sortedItems.length === 0 && !loading ? (
          <div className="border rounded-xl p-6 shadow bg-white dark:bg-zinc-900">
            <p className="text-gray-600 dark:text-gray-300">Your cart is empty.</p>
            <Link to="/marketplace" className="inline-block mt-3 text-blue-600 hover:underline">
              Browse items
            </Link>
          </div>
        ) : (
          // Main layout: flex on all sizes, column → row on lg
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: list (flex column, grows) */}
            <div className="flex-1 flex flex-col gap-4">
              {sortedItems.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="border rounded-xl p-4 shadow bg-white dark:bg-zinc-900 flex flex-col sm:flex-row gap-4"
                >
                  {/* Media: fixed-size thumb that doesn't stretch UI */}
                  <div className="flex-none w-full sm:w-40">
                    <img
                      src={imgFromItem(item)}
                      alt={item.item_name}
                      className="w-full h-40 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.jpg';
                      }}
                    />
                  </div>

                  {/* Content: flexible column */}
                  <div className="flex-1 flex flex-col min-w-0">
                    {/* Title and price row: flexible spacing */}
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/items/${item.item_slug ?? String(item.item_id)}`}
                        className="text-lg font-bold text-blue-600 hover:underline truncate"
                        title={item.item_name}
                      >
                        {item.item_name}
                      </Link>
                    </div>

                    {/* Controls area: let inner card manage, but keep layout flexible */}
                    <div className="mt-3 flex">
                      <div className="flex-1">
                        <CartItemCard
                          item={item} // avoid any; if needed, widen CartItemCard's prop type to accept this shape
                          onAdd={addItem}
                          onDecrement={decrementItem}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: summary column (sticky on desktop), flex card */}
            <aside className="lg:w-96 w-full lg:shrink-0">
              <div className="sticky top-20">
                <div className="border rounded-xl p-4 shadow bg-white dark:bg-zinc-900 flex flex-col">
                  <div className="text-lg font-bold mb-1">Order Summary</div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      Items:{' '}
                      <span className={loading ? 'animate-pulse text-gray-400' : ''}>
                        {itemCount}
                      </span>
                    </div>
                    <div className="font-semibold">
                      Total:{' '}
                      <span className={loading ? 'animate-pulse text-gray-400' : ''}>
                        {(total / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions area: flexible row on wide, stacked on narrow */}
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleCheckout}
                      disabled={loading || orderLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {orderLoading ? 'Processing...' : 'Pay Now'}
                    </button>
                    <button
                      onClick={reloadCart}
                      className="border rounded-lg py-3 px-6 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 w-full"
                    >
                      Refresh
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link
                      to="/orders"
                      className="text-center border rounded-lg py-2 px-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 flex-1"
                    >
                      View orders
                    </Link>
                    <Link
                      to="/marketplace"
                      className="text-center border rounded-lg py-2 px-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 flex-1"
                    >
                      Continue shopping
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;
