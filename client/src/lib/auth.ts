import { apiRequest } from "./queryClient";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("auth_token");
}

export function getUser(): User | null {
  const userStr = localStorage.getItem("auth_user");
  return userStr ? JSON.parse(userStr) : null;
}

export function setUser(user: User): void {
  localStorage.setItem("auth_user", JSON.stringify(user));
}

export function removeUser(): void {
  localStorage.removeItem("auth_user");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/login", { email, password });
  const data = await response.json();
  
  setToken(data.token);
  setUser(data.user);
  
  return data;
}

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/register", { username, email, password });
  const data = await response.json();
  
  setToken(data.token);
  setUser(data.user);
  
  return data;
}

export function logout(): void {
  removeToken();
  removeUser();
  window.location.href = "/login";
}
