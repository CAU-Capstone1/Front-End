/*
인증 관련 유틸리티
백엔드 서버 API와 통신하여 인증 처리
토큰 기반 인증 사용 (JWT 등)

작동 방식:
1. 회원가입/로그인 시 서버 API 호출
2. 서버에서 받은 토큰과 사용자 정보를 localStorage에 저장
3. API 요청 시 Authorization 헤더에 토큰 포함
4. 토큰은 "auth:token" 키에, 사용자 정보는 "auth:currentUser" 키에 저장
*/

import { signUpApi, loginApi, getCurrentUserApi, logoutApi, type User, type AuthResponse } from "../api/authApi";

const STORAGE_KEY_USER = "auth:currentUser";
const STORAGE_KEY_TOKEN = "auth:token";
const STORAGE_KEY_REFRESH_TOKEN = "auth:refreshToken"; 

// localStorage 사용 가능 여부 확인 (브라우저 환경 체크)
const storage = typeof window !== "undefined" ? window.localStorage : undefined;

// 토큰 가져오기
export function getToken(): string | null {
    if (!storage) return null;
    return storage.getItem(STORAGE_KEY_TOKEN);
}

// 리프레시 토큰 가져오기
export function getRefreshToken(): string | null {
    if (!storage) return null;
    return storage.getItem(STORAGE_KEY_REFRESH_TOKEN);
}

// 토큰 저장
function setToken(token: string, refreshToken?: string): void {
    if (!storage) {
        console.error("Error: localStorage is not available for token storage.");
        return;
    }
    
    // 토큰이 실제로 존재하는지 확인 후 저장
    if (token) {
        storage.setItem(STORAGE_KEY_TOKEN, token);
    }
    if (refreshToken) {
        storage.setItem(STORAGE_KEY_REFRESH_TOKEN, refreshToken);
    }
}

// 토큰 삭제
function removeToken(): void {
    if (!storage) return;
    storage.removeItem(STORAGE_KEY_TOKEN);
    storage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
}

// 회원가입
export async function signUp(email: string, password: string, name: string): Promise<User> {
    if (!storage) {
        throw new Error("localStorage is not available");
    }

    try {
        const response: AuthResponse = await signUpApi({
            email: email.trim(),
            password: password,
            name: name.trim(),
            username: email.trim(), // email을 username 필드로 사용
        });
        
        // 🚨 수정: accessToken만 사용하도록 명확히 함.
        const tokenToSave = response.accessToken; 

        // 런타임 검사 추가
        if (!tokenToSave) {
            throw new Error("회원가입 성공 후 토큰을 받지 못했습니다.");
        }
        
        // 토큰과 사용자 정보 저장
        setToken(tokenToSave, response.refreshToken);
        if (storage) {
            // response.user는 이제 User 타입이며, null이 아님 (백엔드 수정 완료)
            storage.setItem(STORAGE_KEY_USER, JSON.stringify(response.user));
        }

        return response.user;
    } catch (error) {
        // 에러 메시지 추출
        const errorMessage = error instanceof Error ? error.message : "회원가입에 실패했습니다.";
        throw new Error(errorMessage);
    }
}

// 로그인
export async function login(email: string, password: string): Promise<AuthResponse> { 
    if (!storage) {
        throw new Error("localStorage is not available");
    }

    try {
        const response: AuthResponse = await loginApi({
            email: email.trim(),
            password: password,
        });

        // 🚨 수정: accessToken만 사용하도록 명확히 함.
        const tokenToSave = response.accessToken;
        
        // 런타임 검사 추가
        if (!tokenToSave) {
            throw new Error("로그인 성공 후 토큰을 받지 못했습니다.");
        }
        
        // 핵심: 토큰과 사용자 정보 저장
        setToken(tokenToSave, response.refreshToken);
        
        if (storage) {
             // response.user는 이제 User 타입이며, null이 아님 (백엔드 수정 완료)
             storage.setItem(STORAGE_KEY_USER, JSON.stringify(response.user));
        }

        return response; 
    } catch (error) {
        // 에러 메시지 추출
        const errorMessage = error instanceof Error ? error.message : "로그인에 실패했습니다.";
        throw new Error(errorMessage);
    }
}

// 로그아웃
export async function logout(): Promise<void> {
    if (!storage) return;

    const token = getToken();
    
    // 서버에 로그아웃 요청 (토큰이 있는 경우)
    if (token) {
        try {
            await logoutApi(token);
        } catch (error) {
            console.warn("로그아웃 API 호출 실패:", error);
            // 서버 호출 실패해도 클라이언트에서는 토큰 삭제
        }
    }

    // 로컬 스토리지에서 토큰과 사용자 정보 삭제
    removeToken();
    storage.removeItem(STORAGE_KEY_USER);
}

// 현재 로그인된 사용자 가져오기
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

// 서버에서 현재 사용자 정보 갱신
export async function refreshCurrentUser(): Promise<User | null> {
    const token = getToken();
    if (!token) {
        // 토큰이 없으면 로그아웃 처리
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
        // 토큰이 만료되었거나 유효하지 않은 경우 로그아웃 처리
        await logout();
        return null;
    }
}

// 로그인 여부 확인
export function isLoggedIn(): boolean {
    const token = getToken();
    const user = getCurrentUser();
    return !!(token && user);
}

// API 요청에 사용할 Authorization 헤더 생성
export function getAuthHeaders(): Record<string, string> {
    const token = getToken();
    if (!token) {
        return {};
    }
    return {
        Authorization: `Bearer ${token}`,
    };
}