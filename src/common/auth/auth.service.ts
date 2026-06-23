import * as AuthApis from "@/api/auth";
import { useUserStore } from "@/application/store/user";

export const AuthService = {
  ...AuthApis,
  async login(credentials: Api.Auth.LoginParams): Promise<any> {
    try {
      const response = await AuthApis.fetchLogin(credentials);
      const token = response.accessToken;
      if (!token) {
        throw new Error("No access token received");
      }
      // Store token in localStorage for persistence
      localStorage.setItem("auth_token", token);
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
      localStorage.removeItem("auth_token");
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
    return localStorage.getItem("auth_token");
  },
  setToken(token: string): void {
    localStorage.setItem("auth_token", token);
  },
  clearToken(): void {
    localStorage.removeItem("auth_token");
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
