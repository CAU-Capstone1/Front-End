import { signUpApi, loginApi, getCurrentUserApi, logoutApi, type User, type AuthResponse } from "../api/authApi";
import { resetAnswers } from "./compositionSession";
const STORAGE_KEY_USER = "auth:currentUser";
const STORAGE_KEY_TOKEN = "auth:token";
const STORAGE_KEY_REFRESH_TOKEN = "auth:refreshToken"; 
const storage = typeof window !== "undefined" ? window.localStorage : undefined;
export function getToken(): string | null {
    if (!storage) return null;
    return storage.getItem(STORAGE_KEY_TOKEN);
}
export function getRefreshToken(): string | null {
    if (!storage) return null;
    return storage.getItem(STORAGE_KEY_REFRESH_TOKEN);
}
function setToken(token: string, refreshToken?: string): void {
    if (!storage) {
        console.error("Error: localStorage is not available for token storage.");
        return;
    }
    if (token) {
        storage.setItem(STORAGE_KEY_TOKEN, token);
    }
    if (refreshToken) {
        storage.setItem(STORAGE_KEY_REFRESH_TOKEN, refreshToken);
    }
}
function removeToken(): void {
    if (!storage) return;
    storage.removeItem(STORAGE_KEY_TOKEN);
    storage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
}
export async function signUp(email: string, password: string, name: string): Promise<User> {
    if (!storage) {
        throw new Error("localStorage is not available");
    }
    try {
        const response: AuthResponse = await signUpApi({
            email: email.trim(),
            password: password,
            name: name.trim(),
            username: email.trim(), 
        });
        const tokenToSave = response.accessToken; 
        if (!tokenToSave) {
            throw new Error("회원가입 성공 후 토큰을 받지 못했습니다.");
        }
        setToken(tokenToSave, response.refreshToken);
        if (storage) {
            storage.setItem(STORAGE_KEY_USER, JSON.stringify(response.user));
        }
        return response.user;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "회원가입에 실패했습니다.";
        throw new Error(errorMessage);
    }
}
export async function login(email: string, password: string): Promise<AuthResponse> { 
    if (!storage) {
        throw new Error("localStorage is not available");
    }
    try {
        const response: AuthResponse = await loginApi({
            email: email.trim(),
            password: password,
        });
        const tokenToSave = response.accessToken;
        if (!tokenToSave) {
            throw new Error("로그인 성공 후 토큰을 받지 못했습니다.");
        }
        setToken(tokenToSave, response.refreshToken);
        if (storage) {
             storage.setItem(STORAGE_KEY_USER, JSON.stringify(response.user));
        }
        return response; 
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "로그인에 실패했습니다.";
        throw new Error(errorMessage);
    }
}
export async function logout(): Promise<void> {
    if (!storage) return;
    const token = getToken();
    if (token) {
        try {
            await logoutApi(token);
        } catch (error) {
            console.warn("로그아웃 API 호출 실패:", error);
        }
    }
    removeToken();
    storage.removeItem(STORAGE_KEY_USER);
    resetAnswers();
}
export function getCurrentUser(): User | null {
    if (!storage) return null;
    try {
        const data = storage.getItem(STORAGE_KEY_USER);
        if (!data) return null;
        return JSON.parse(data) as User;
    } catch (error) {
        console.error("Failed to load current user:", error);
        return null;
    }
}
export async function refreshCurrentUser(): Promise<User | null> {
    const token = getToken();
    if (!token) {
        await logout();
        return null;
    }
    try {
        const user = await getCurrentUserApi(token);
        if (storage) {
            storage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        }
        return user;
    } catch (error) {
        console.error("Failed to refresh current user:", error);
        await logout();
        return null;
    }
}
export function isLoggedIn(): boolean {
    const token = getToken();
    const user = getCurrentUser();
    return !!(token && user);
}
export function getAuthHeaders(): Record<string, string> {
    const token = getToken();
    if (!token) {
        return {};
    }
    return {
        Authorization: `Bearer ${token}`,
    };
}