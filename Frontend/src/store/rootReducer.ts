import { combineReducers } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/cartSlice';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/user/userSlice';
import orderReducer from '../features/order/orderSlice'
import itemSearchReducer from '../features/item/itemSearchSlice'

const rootReducer = combineReducers({
  user: userReducer,
  auth: authReducer,
  itemSearch: itemSearchReducer,
  cart: cartReducer,
  order: orderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;  // Changed from AppState to RootState
export default rootReducer;
