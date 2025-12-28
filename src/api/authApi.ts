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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD ? "http://3.36.255.180:8080/api" : "/api");
async function fetchWithTimeout(url: string, options: RequestInit, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error("요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.");
        }
        throw error;
    }
}
async function handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    let errorData: ApiError | null = null;
    try {
        if (contentType?.includes("application/json")) {
            errorData = await response.json();
        } else {
            const text = await response.text();
            errorData = { message: text || response.statusText };
        }
    } catch (e) {
        errorData = { message: response.statusText || "알 수 없는 오류가 발생했습니다." };
    }
    if (!response.ok) {
        const errorMessage = errorData?.message || `HTTP ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
    }
    return errorData as T;
}
export async function signUpApi(data: SignupRequest): Promise<AuthResponse> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
}
export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
}
export async function getCurrentUserApi(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });
    return handleResponse<User>(response);
}
export async function logoutApi(token: string): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    } catch (error) {
        console.warn("로그아웃 API 호출 실패:", error);
    }
}
export async function refreshTokenApi(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken }),
    });
    return handleResponse<AuthResponse>(response);
}