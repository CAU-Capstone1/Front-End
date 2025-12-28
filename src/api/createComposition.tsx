import { getAuthHeaders } from "../utils/auth"; 
import type { CompositionAnswers } from "../utils/compositionSession"; 
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
    const headers = { 
        "Content-Type": "application/json",
        ...getAuthHeaders(), 
    };
    const url = `${API_BASE_URL}/compose`;
    if (import.meta.env.DEV) {
        console.log("🌐 API 요청 URL:", url);
        const authHeaders = getAuthHeaders();
        console.log("📤 요청 헤더:", { 
            "Content-Type": headers["Content-Type"],
            Authorization: authHeaders.Authorization ? "Bearer ***" : "없음" 
        });
        console.log("📦 요청 본문:", body);
    }
    const response = await fetch(url, {
        method: "POST",
        headers: headers, 
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        if (response.status === 401) {
            console.error("❌ 인증 실패: 로그인이 필요합니다.");
            if (typeof window !== "undefined") {
                const shouldRedirect = confirm("로그인이 만료되었습니다. 로그인 페이지로 이동하시겠습니까?");
                if (shouldRedirect) {
                    window.location.href = "/login?returnUrl=/review";
                }
            }
            throw new Error("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
        }
        let errorMessage = "";
        try {
            const message = await response.text();
            errorMessage = message;
            console.error("❌ 서버 에러 응답:", message);
            try {
                const errorJson = JSON.parse(message);
                if (errorJson.message) {
                    errorMessage = errorJson.message;
                } else if (errorJson.error) {
                    errorMessage = errorJson.error;
                }
            } catch {
            }
        } catch {
            errorMessage = `서버 오류 (${response.status})`;
        }
        throw new Error(`작곡 요청 실패 (${response.status}): ${errorMessage}`);
    }
    return response.json().catch(() => ({}));
}
export function buildCompositionBody(answers: CompositionAnswers): CompositionRequestBody {
    const referenceVisual = answers.referenceVisual;
    const isBase64 = referenceVisual && referenceVisual.startsWith("data:");
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
        referenceVisual: isBase64 ? null : (referenceVisual ?? null),
    };
}