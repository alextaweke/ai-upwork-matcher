// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import {
  login as loginAPI,
  register as registerAPI,
  getUserProfile,
} from "@/services/api";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    password2: string,
  ) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await loginAPI({ username, password });
          const { access, refresh, user } = response.data;

          Cookies.set("access_token", access, { expires: 1 });
          Cookies.set("refresh_token", refresh, { expires: 7 });

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (
        username: string,
        email: string,
        password: string,
        password2: string,
      ) => {
        set({ isLoading: true });
        try {
          const response = await registerAPI({
            username,
            email,
            password,
            password2,
          });
          const { access, refresh, user } = response.data;

          Cookies.set("access_token", access, { expires: 1 });
          Cookies.set("refresh_token", refresh, { expires: 7 });

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        set({ user: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        try {
          const response = await getUserProfile();
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
