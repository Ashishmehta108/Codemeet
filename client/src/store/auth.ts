import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  refreshToken?: string;
}

export interface AuthStore {
  user: User | null | undefined;
  setUser: (user: User | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  login: (
    name: string,
    password: string
  ) => Promise<{
    access_token: string;
    refresh_token: string;
    message: string;
  }>;
  logout: () => void;
  register: (
    email: string,
    name: string,
    password: string
  ) => Promise<{
    message: string;
    user: User;
  }>;
  fetchUser: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
console.log(import.meta.env);
export const useAuthStore = create<AuthStore>()(
  persist<AuthStore>(
    (set, get) => ({
      user: undefined,
      loading: true,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),

      login: async (name, password) => {
        set({ loading: true });
        try {
          const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name, password }),
          });
          if (!res.ok) throw new Error("Invalid username or password");
          const data = await res.json();
          set({ user: data.user });
          return data.user;
        } finally {
          set({ loading: false });
        }
      },

      logout: () => set({ user: null }),

      register: async (email, name, password) => {
        set({ loading: true });
        try {
          const res = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, name, password }),
          });
          if (!res.ok) throw new Error("Registration failed");
          const data = await res.json();
          set({ user: data.user });
          return {
            message: data.message,
            user: {
              id: data.userId,
              name: data.name,
              email: data.email,
            },
          };
        } finally {
          set({ loading: false });
        }
      },

      fetchUser: async () => {
        set({ loading: true });
        try {
          const res = await fetch(`${API_BASE_URL}/user/info`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (!res.ok) {
            set({ user: null });
            return;
          }
          const data = await res.json();
          set({ user: data.user });
        } finally {
          set({ loading: false });
        }
      },

      restoreSession: async () => {
        set({ loading: true });
        try {
          const res = await fetch(`${API_BASE_URL}/auth/session`, {
            credentials: "include",
          });
          if (!res.ok) {
            set({ user: null });
            return;
          }
          const data = await res.json();
          set({ user: data.user });
        } finally {
          set({ loading: false });
        }
      },

      updateUser: async (updates) => {
        if (!get().user) return;
        set({ loading: true });
        try {
          const res = await fetch(`${API_BASE_URL}/user/${get().user!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updates),
          });
          if (!res.ok) throw new Error("Failed to update user");
          const updated = await res.json();
          set({ user: updated.user });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
