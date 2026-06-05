import { API_BASE_URL, handleResponse, fetchWithTimeout } from "../lib/apiClient";

export type User = {
    id: string;
    email: string;
    name: string;
    createdAt: string;
};

export type SignupRequest = {
    email: string;
    password: string;
    name: string;
    username: string;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type AuthResponse = {
    user: User;
    accessToken: string;
    refreshToken?: string;
    token?: string;
};

export type ApiError = {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
};

export async function signUpApi(data: SignupRequest): Promise<AuthResponse> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
}

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
}

export async function getCurrentUserApi(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse<User>(response);
}

export async function logoutApi(token: string): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
    } catch (error) {
        console.warn("로그아웃 API 호출 실패:", error);
    }
}

export async function refreshTokenApi(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
    });
    return handleResponse<AuthResponse>(response);
}
