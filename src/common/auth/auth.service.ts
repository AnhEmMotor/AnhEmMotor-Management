import * as AuthApis from "@/api/auth";
import { useUserStore } from "@/application/store/user";

interface AuthState {
  token: string | null;
  userInfo: Api.Auth.UserInfo | null;
  isAuthenticated: boolean;
}

const AuthService = {
  async login(credentials: Api.Auth.LoginParams): Promise<AuthState> {
    try {
      const response = await AuthApis.fetchLogin(credentials);
      const token = response.accessToken;
      if (!token) {
        throw new Error("No access token received");
      }
      // Store token in localStorage for persistence under the same key Pinia uses
      localStorage.setItem("user", JSON.stringify({ accessToken: token }));
      // Sync token to userStore for API interceptor
      const userStore = useUserStore();
      userStore.setToken(token);
      // Fetch user info after login
      const userInfo = await this.getUserInfo();
      return {
        token,
        userInfo,
        isAuthenticated: true,
      };
    } catch (error) {
      console.error("[AuthService] Login failed:", error);
      localStorage.removeItem("user");
      throw error;
    }
  },

  async getUserInfo(): Promise<Api.Auth.UserInfo | null> {
    try {
      const response = await AuthApis.fetchGetUserInfo();
      return response as Api.Auth.UserInfo;
    } catch (error) {
      console.error("[AuthService] Get user info failed:", error);
      return null;
    }
  },

  getToken(): string | null {
    // Try to get token from store first, then from localStorage
    const userStore = useUserStore();
    if (userStore.accessToken) {
      return userStore.accessToken;
    }

    // Fallback to localStorage if store not hydrated yet
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const data = JSON.parse(userData);
        return data.accessToken;
      } catch {
        return null;
      }
    }
    return null;
  },

  setToken(token: string): void {
    localStorage.setItem("user", JSON.stringify({ accessToken: token }));
    const userStore = useUserStore();
    userStore.setToken(token);
  },

  clearToken(): void {
    localStorage.removeItem("user");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async logout(): Promise<void> {
    this.clearToken();
    const userStore = useUserStore();
    userStore.logOut();
  },
};

export const authService = AuthService;
