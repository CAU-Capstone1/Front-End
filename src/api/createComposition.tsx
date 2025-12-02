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

    const requestBody = JSON.stringify(body);
    console.log("📤 작곡 요청 데이터:", body);
    console.log("📤 작곡 요청 본문:", requestBody);
    console.log("📤 작곡 요청 헤더:", headers);

    // 타임아웃 설정 (60초)
    const TIMEOUT_MS = 60000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
        console.error("⏰ 요청 타임아웃: 60초 내에 서버 응답이 없습니다.");
    }, TIMEOUT_MS);

    try {
        const response = await fetch("/api/compose", {
            method: "POST",
            headers: headers,
            body: requestBody,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log("📥 서버 응답 상태:", response.status, response.statusText);
        console.log("📥 서버 응답 헤더:", Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            let errorMessage: string = "";
            const contentType = response.headers.get("content-type");
            
            try {
                // 응답 본문을 텍스트로 먼저 읽기
                const responseText = await response.text();
                console.error("❌ 서버 응답 원문 (텍스트):", responseText);
                console.error("❌ 응답 길이:", responseText.length);
                
                if (responseText.trim()) {
                    // 응답이 있으면 파싱 시도
                    if (contentType?.includes("application/json")) {
                        try {
                            const errorData = JSON.parse(responseText);
                            errorMessage = JSON.stringify(errorData, null, 2);
                            console.error("❌ 서버 오류 응답 (JSON):", errorData);
                        } catch (e) {
                            errorMessage = responseText;
                            console.error("❌ JSON 파싱 실패, 원문 사용:", e);
                        }
                    } else {
                        errorMessage = responseText;
                        console.error("❌ 서버 오류 응답 (텍스트):", errorMessage);
                    }
                } else {
                    // 응답 본문이 비어있을 때
                    errorMessage = response.statusText || "서버가 상세 오류 메시지를 반환하지 않았습니다.";
                    console.error("❌ 서버 응답 본문이 비어있습니다.");
                    console.error("❌ 상태 코드:", response.status);
                    console.error("❌ 상태 텍스트:", response.statusText);
                    console.error("❌ 응답 헤더:", Object.fromEntries(response.headers.entries()));
                }
            } catch (e) {
                errorMessage = `응답을 읽을 수 없습니다: ${String(e)}`;
                console.error("❌ 응답 읽기 오류:", e);
            }
            
            const finalErrorMessage = errorMessage || "알 수 없는 서버 오류가 발생했습니다.";
            throw new Error(`작곡 요청 실패 (${response.status}): ${finalErrorMessage}`);
        }

        const result = await response.json();
        console.log("✅ 작곡 요청 성공:", result);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error) {
            if (error.name === "AbortError") {
                throw new Error("요청 시간이 초과되었습니다. 서버가 응답하지 않습니다. 잠시 후 다시 시도해주세요.");
            }
            if (error.message === "Failed to fetch") {
                throw new Error("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
            }
        }
        throw error;
    }
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