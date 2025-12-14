import { getAuthHeaders } from "../utils/auth"; // 인증 헤더를 가져오기 위한 import
import type { CompositionAnswers } from "../utils/compositionSession"; // 로컬 유틸리티 타입 import

// API 기본 URL (환경 변수로 설정 가능)
// 프로덕션에서는 절대 경로 사용, 개발 환경에서는 프록시 사용
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD ? "http://3.36.255.180:8080/api" : "/api");

export type CompositionRequestBody = {
    style?: string | null;
    mood?: string | null;
    instrument?: string | null;
    key?: string | null;
    duration?: string | null;
    tempo?: string | null;
    hummingStart?: string | null;
    hummingMain?: string | null;
    hummingEnd?: string | null;
    referenceVisual?: string | null;
};

export async function createComposition(body: CompositionRequestBody) {
    
    // Authorization 헤더를 추가합니다.
    const headers = { 
        "Content-Type": "application/json",
        // 로그인 성공 후 저장된 토큰을 읽어와 "Authorization: Bearer <token>" 형태로 추가
        ...getAuthHeaders(), 
    };

<<<<<<< HEAD
    const url = `${API_BASE_URL}/compose`;
    console.log("🌐 API 요청 URL:", url);
    console.log("📤 요청 헤더:", headers);
    console.log("📦 요청 본문:", body);

    const response = await fetch(url, {
=======
    const response = await fetch(`${API_BASE_URL}/compose`, {
>>>>>>> adf7bac0d7374e9d6a094c9df992657250953e2e
        method: "POST",
        headers: headers, // 수정된 headers를 사용
        body: JSON.stringify(body),
    });

    console.log("📥 응답 상태:", response.status, response.statusText);

    if (!response.ok) {
        const message = await response.text();
        console.error("❌ 서버 에러 응답:", message);
        throw new Error(`작곡 요청 실패 (${response.status}): ${message}`);
    }

    return response.json().catch(() => ({}));
}

export function buildCompositionBody(answers: CompositionAnswers): CompositionRequestBody {
    return {
        style: answers.style ?? null,
        mood: answers.mood ?? null,
        instrument: answers.instrument ?? null,
        key: answers.key ?? null,
        duration: answers.duration ?? null,
        tempo: answers.tempo ?? null,
        hummingStart: answers.hummingStart ?? null,
        hummingMain: answers.hummingMain ?? null,
        hummingEnd: answers.hummingEnd ?? null,
        referenceVisual: answers.referenceVisual ?? null,
    };
}