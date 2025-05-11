import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',  // Enables Redux DevTools in development
});

export default store;

// TypeScript types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;  // Already consistent
export type AppDispatch = typeof store.dispatch;
