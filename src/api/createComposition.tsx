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

    // 타임아웃 설정 (2분 - 음악 생성은 시간이 걸릴 수 있음)
    const TIMEOUT_MS = 120000;
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
        
        // 응답 본문을 먼저 읽어서 확인 (500 오류여도 결과가 포함될 수 있음)
        const contentType = response.headers.get("content-type") || "";
        let responseText = "";
        
        try {
            responseText = await response.text();
            console.log("📥 서버 응답 원문 (텍스트):", responseText);
            console.log("📥 응답 길이:", responseText.length);
        } catch (e) {
            console.error("❌ 응답 본문 읽기 실패:", e);
            throw new Error("서버 응답을 읽을 수 없습니다.");
        }
        
        // 응답 본문이 있는지 확인
        if (responseText.trim()) {
            // JSON 형식인지 확인
            if (contentType.includes("application/json") || responseText.trim().startsWith("{")) {
                try {
                    const result = JSON.parse(responseText);
                    console.log("✅ 서버 응답 파싱 성공:", result);
                    
                    // 500 오류여도 결과 데이터가 포함되어 있으면 사용
                    if (!response.ok && response.status === 500) {
                        // 결과 데이터가 있는지 확인 (audioUrl, musicUrl 등)
                        const hasResultData = result.audioUrl || result.musicUrl || result.fileUrl || 
                                           result.url || result.audio_url || result.music_url ||
                                           result.id || result.compositionId;
                        
                        if (hasResultData) {
                            console.warn("⚠️ 서버가 500 오류를 반환했지만 결과 데이터가 포함되어 있습니다. 결과를 사용합니다.");
                            console.log("✅ 결과 데이터:", result);
                            return result;
                        }
                    }
                    
                    // 정상 응답인 경우 (200, 201, 202 등)
                    if (response.ok) {
                        // 202 Accepted이고 job ID가 있으면 비동기 작업 (백엔드 DTO의 jobId 필드를 우선 확인)
                        if (response.status === 202 && (result.jobId || result.PublicJobId || result.id)) {
                            console.log("⏳ 비동기 작업 시작됨 (202 Accepted):", result);
                            // job ID를 포함한 결과 반환
                            return result;
                        }
                        // 즉시 완료된 경우
                        return result;
                    }
                    
                    // 오류 응답인 경우
                    const errorMessage = JSON.stringify(result, null, 2);
                    throw new Error(`작곡 요청 실패 (${response.status}): ${errorMessage}`);
                } catch (parseError) {
                    console.error("❌ JSON 파싱 실패:", parseError);
                    // JSON이 아니면 텍스트로 처리
                }
            }
        }
        
        // 응답 본문이 비어있거나 JSON이 아닌 경우
        if (!response.ok) {
            let errorMessage: string = "";
            
            if (responseText.trim()) {
                errorMessage = responseText;
                console.error("❌ 서버 오류 응답 (텍스트):", errorMessage);
            } else {
                // 응답 본문이 비어있을 때
                console.error("❌ 서버 응답 본문이 비어있습니다.");
                console.error("❌ 상태 코드:", response.status);
                console.error("❌ 상태 텍스트:", response.statusText);
                
                if (response.status === 500) {
                    errorMessage = "서버에서 오류가 발생했습니다. 가능한 원인:\n" +
                        "• 업로드한 파일을 서버에서 찾을 수 없음\n" +
                        "• 서버 내부 처리 오류\n" +
                        "• 서버 로그를 확인해주세요\n\n" +
                        "잠시 후 다시 시도하거나, 서버 관리자에게 문의해주세요.";
                } else {
                    errorMessage = response.statusText || "서버가 상세 오류 메시지를 반환하지 않았습니다.";
                }
            }
            
            const finalErrorMessage = errorMessage || "알 수 없는 서버 오류가 발생했습니다.";
            
            if (response.status === 500) {
                throw new Error(`서버 오류가 발생했습니다 (500)\n\n${finalErrorMessage}\n\n요청 데이터를 확인했습니다:\n${JSON.stringify(body, null, 2)}`);
            }
            
            throw new Error(`작곡 요청 실패 (${response.status}): ${finalErrorMessage}`);
        }
        
        // 정상 응답인데 본문이 비어있는 경우
        throw new Error("서버가 빈 응답을 반환했습니다.");
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