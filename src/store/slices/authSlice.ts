import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  avatar?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Async thunk for checking auth status
export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
  const response = await fetch("/api/auth/me");
  if (!response.ok) {
    throw new Error("Not authenticated");
  }
  const data = await response.json();
  return data.user;
});

// Async thunk for login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }
    
    return data.user;
  }
);

// Async thunk for register
export const register = createAsyncThunk(
  "auth/register",
  async (userData: {
    name: string;
    email: string;
    password: string;
    adminKey?: string;
  }) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }
    
    return data.user;
  }
);

// Async thunk for logout
export const logout = createAsyncThunk("auth/logout", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Login failed";
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Registration failed";
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
