import React, { useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks/hooks';
import {
  createOrderFromCart,
  selectOrderLoading,
  selectOrderError,
} from '../order/orderSlice';
import { useNavigate } from 'react-router-dom';
import { useCart, useCartSummary } from '@/store/hooks/useCart';
import { selectCart } from './cartSlice';
import { selectAuthLoaded } from '../auth/authSlice';
import CartItemCard from './CartItemCard';
import DefaultHeader from '@/components/common/DefaultHeader';

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const orderLoading = useAppSelector(selectOrderLoading);
  const orderError = useAppSelector(selectOrderError);
  const authLoaded = useAppSelector(selectAuthLoaded);

  const items = useAppSelector(selectCart);
  const { itemCount, total } = useCartSummary();
  const {
    loading, // cart data still being fetched
    error,
    addItem,
    decrementItem,
    reloadCart,
  } = useCart();

  const hasReloaded = useRef(false);

  useEffect(() => {
    if (authLoaded && !hasReloaded.current) {
      reloadCart();
      hasReloaded.current = true;
    }
  }, [authLoaded, reloadCart]);

  const sortedItems = useMemo(
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
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

        {loading && (
          <div className="flex justify-center mb-4">
            <p className="text-sm text-gray-400 italic animate-pulse">
              Refreshing cart...
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-600 text-center mt-4">Error: {error}</p>
        )}

        {orderError && (
          <p className="text-red-600 text-center mt-4">Error: {orderError}</p>
        )}

        {sortedItems.length === 0 && !loading ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          <>
            <div className="space-y-4">
              {sortedItems.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="transition-all duration-200 ease-in-out"
                >
                  <CartItemCard
                    item={item}
                    onAdd={addItem}
                    onDecrement={decrementItem}
                  />
                </div>
              ))}
            </div>

            <hr className="my-6" />

            <div className="flex flex-col items-start gap-2">
              <h3 className="text-lg font-semibold">
                Total Items:{' '}
                <span className={loading ? 'animate-pulse text-gray-400' : ''}>
                  {itemCount}
                </span>
              </h3>
              <h3 className="text-lg font-semibold">
                Total Price:{' '}
                <span className={loading ? 'animate-pulse text-gray-400' : ''}>
                  ${(total / 100).toFixed(2)}
                </span>
              </h3>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleCheckout}
                disabled={loading || orderLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl w-full max-w-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {orderLoading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartPage;
