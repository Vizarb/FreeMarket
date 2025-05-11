// src/features/auth/authSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "../../types/userType";
import { RootState } from "../../store/rootReducer";
import { clearTokens, getAccessToken, setTokens } from "../../utils/tokenManager";
import { AppDispatch } from "@/store";
import api from '@/api/apiService';
import axios from "axios";

// Thunks
export const loginUser = createAsyncThunk<
  { access: string; refresh: string; username: string },
  { username: string; password: string },
  { rejectValue: string }
>(
  'auth/login',
  async ({ username, password }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/token/', { username, password });
      setTokens(data.access, data.refresh, username);
      dispatch(fetchUserDetails());
      return { ...data, username };
    } catch {
      return rejectWithValue('Invalid username or password');
    }
  }
);

export const fetchUserDetails = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/auth/me/');
      return response.data as User;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.detail || error.message || "Failed to fetch user details"
        );
      }
      return rejectWithValue('Failed to fetch user');
    }
  }
);

// State
interface AuthState {
  isAuthenticated: boolean | null;
  token: string | null;
  user: User | null;
  groups: string[];
  authLoaded: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: localStorage.getItem("accessToken"),
  user: null,
  groups: [],
  authLoaded: false,
};

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.groups = action.payload.user.groups;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.groups = [];
      state.isAuthenticated = false;
      clearTokens();
    },
    setAuthLoaded: (state, action: PayloadAction<boolean>) => {
      state.authLoaded = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.groups = payload.groups;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserDetails.rejected, (state) => {
        state.user = null;
        state.groups = [];
        state.isAuthenticated = false;
      });
  },
});

// Restore auth on app load
export const restoreAuth = (dispatch: AppDispatch) => {
  const token = getAccessToken();
  if (token) {
    dispatch(fetchUserDetails())
      .finally(() => {
        dispatch(setAuthLoaded(true));
      });
  } else {
    dispatch(setAuthLoaded(true));
  }
};


// Selectors
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoaded      = (state: RootState) => state.auth.authLoaded;
export const selectCurrentUser     = (state: RootState) => state.auth.user;
export const selectUserId          = (state: RootState) => state.auth.user?.id ?? null;
export const selectUsername        = (state: RootState) => state.auth.user?.username ?? null;
export const selectGroups          = (state: RootState) => state.auth.groups;

// Actions & reducer
export const { loginSuccess, logout, setAuthLoaded } = authSlice.actions;
export default authSlice.reducer;