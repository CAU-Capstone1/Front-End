/*
인증 관련 API 호출 함수
백엔드 서버와 통신하는 API 함수들
*/

export type User = {
    id: string;
    email: string;
    name: string;
    createdAt: string; // ISO date string
};

export type SignupRequest = {
    email: string;
    password: string;
    name: string;
     username: string; // 백엔드 RegisterRequest DTO와 일치
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type AuthResponse = {
    user: User; // 백엔드 LoginResponse의 user 필드와 일치
    accessToken: string; // 백엔드 LoginResponse의 accessToken 필드와 일치
    refreshToken?: string; // 리프레시 토큰 (선택사항)
    token?: string;
};

export type ApiError = {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
};

// API 기본 URL (환경 변수로 설정 가능)
// 프로덕션에서는 절대 경로 사용, 개발 환경에서는 프록시 사용
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD ? "http://3.36.255.180:8080/api" : "/api");

// 타임아웃을 포함한 fetch 래퍼
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

// 공통 에러 처리 함수
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

// 회원가입 API
export async function signUpApi(data: SignupRequest): Promise<AuthResponse> {
    // [수정 완료]: 백엔드 AuthController의 @PostMapping("/register")와 일치시킵니다.
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

// 로그인 API
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

// 현재 사용자 정보 조회 API
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

// 로그아웃 API (선택사항 - 서버에서 토큰 무효화)
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
        // 로그아웃 실패해도 클라이언트에서는 토큰을 삭제하므로 무시
        console.warn("로그아웃 API 호출 실패:", error);
    }
}

// 토큰 갱신 API (리프레시 토큰 사용 시)
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