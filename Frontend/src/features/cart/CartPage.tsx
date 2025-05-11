import React, { useEffect } from 'react';
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

  useEffect(() => {
    if (authLoaded) {
      reloadCart();
    }
  }, [authLoaded, reloadCart]);
  
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
    <div>
      <h2>Your Cart</h2>
      {!items || items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.cart_item_id || Math.random()} style={{ borderBottom: '1px solid #ccc', padding: '1rem 0' }}>
              <h4>{item.item_name}</h4>
              <p>Price: ${(item.latest_price / 100).toFixed(2)}</p>
              <p>Quantity: {item.total_quantity}</p>
              <p>Subtotal: ${((item.latest_price * item.total_quantity) / 100).toFixed(2)}</p>

              {/* Add buttons */}
              <button onClick={() => addItem(item.item_id)}>Add More</button>
              <button onClick={() => decrementItem(item)}>
                {item.total_quantity > 1 ? 'Decrease' : 'Remove'}
              </button>
            </li>
          ))}
        </ul>
      )}

      <hr />
      <h3>Total Items: {itemCount}</h3>
      <h3>Total Price: ${(total / 100).toFixed(2)}</h3>
      <button onClick={handleCheckout}>Pay</button>
    </div>
  );
};

export default CartPage;
