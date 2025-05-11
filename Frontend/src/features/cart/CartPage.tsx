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

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const orderLoading = useAppSelector(selectOrderLoading);
  const orderError = useAppSelector(selectOrderError);

  const { itemCount, total } = useCartSummary();
  const {
    loading,
    error,
    addItem,
    decrementItem,
    reloadCart,
  } = useCart();

  const items = useAppSelector(selectCart);
  const authLoaded = useAppSelector(selectAuthLoaded);

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
      navigate('/order-confirmation', { state: { order: result.payload } });
    }
  };

  if (loading || orderLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (orderError) return <p>Error: {orderError}</p>;

return (
  <div className="max-w-3xl mx-auto px-4">
    <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

    {sortedItems.length === 0 ? (
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
          <h3 className="text-lg font-semibold">Total Items: {itemCount}</h3>
          <h3 className="text-lg font-semibold">
            Total Price: ${(total / 100).toFixed(2)}
          </h3>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleCheckout}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl w-full max-w-sm"
          >
            Pay Now
          </button>
        </div>
      </>
    )}
  </div>
)};

export default CartPage;
