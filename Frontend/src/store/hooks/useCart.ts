import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  selectCart,
  selectCartLoading,
  selectCartError,
  refreshCart,
} from '@/features/cart/cartSlice';
import { CartOverviewResponse } from '@/types/apiResponseType';
import { calculateCartSummary } from '@/utils/cartUtils';
import { useCallback } from 'react';
import { toast } from 'sonner';

export function useCartSummary() {
    const items = useAppSelector(selectCart);
    return calculateCartSummary(items);
  }

export const useCart = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCart);
  const loading = useAppSelector(selectCartLoading);
  const error = useAppSelector(selectCartError);

  const addItem = async (item_id: number) => {
    try {
      dispatch(addToCart({ item_id, quantity: 1 })).unwrap();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to add item to cart");
      }
    }
  };
const removeItem = async (cart_item_id: number | undefined) => {
  if (!cart_item_id) {
    toast.error('Invalid cart item');
    return;
  }

  try {
    await dispatch(removeFromCart(cart_item_id)).unwrap(); // 🔥 critical
    toast.success('Item removed');
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Failed to remove item');
    }
  }
};

  

  const decrementItem = (item: CartOverviewResponse) => {
    if (!item.cart_item_id) {
      toast.error('Missing cart item ID');
      return;
    }

    if (item.total_quantity > 1) {
      dispatch(updateCartItem({
        cart_item_id: item.cart_item_id,
        quantity: item.total_quantity - 1
      }));
    } else {
      removeItem(item.cart_item_id);
    }
  };

  const reloadCart = useCallback(() => {
    dispatch(refreshCart());
  }, [dispatch]);

  return {
    cartItems,
    loading,
    error,
    addItem,
    decrementItem,
    removeItem,
    reloadCart,
  };
};
