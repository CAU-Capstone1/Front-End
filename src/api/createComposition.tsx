import { getAuthHeaders } from "../utils/auth"; // 인증 헤더를 가져오기 위한 import
import type { CompositionAnswers } from "../utils/compositionSession"; // 로컬 유틸리티 타입 import

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

    const response = await fetch("/api/compose", {
        method: "POST",
        headers: headers, // 수정된 headers를 사용
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const message = await response.text();
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