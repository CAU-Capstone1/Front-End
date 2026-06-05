import { API_BASE_URL } from "../lib/apiClient";
import { getAuthHeaders } from "../utils/auth";
import type { CompositionAnswers } from "../utils/compositionSession";

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

// Covers all known field name variants the backend may return
export type CompositionResponse = {
    jobId?: string;
    PublicJobId?: string;
    id?: string;
    status?: string;
    Status?: string;
    musicUrl?: string;
    audioUrl?: string;
    fileUrl?: string;
    url?: string;
    audio_url?: string;
    music_url?: string;
    progress?: number;
    errorMessage?: string | null;
};

export async function createComposition(body: CompositionRequestBody): Promise<CompositionResponse> {
    const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
    };

    const response = await fetch(`${API_BASE_URL}/compose`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        if (response.status === 401) {
            const shouldRedirect = confirm("로그인이 만료되었습니다. 로그인 페이지로 이동하시겠습니까?");
            if (shouldRedirect) {
                window.location.href = "/login?returnUrl=/review";
            }
            throw new Error("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
        }

        let errorMessage = `서버 오류 (${response.status})`;
        try {
            const text = await response.text();
            try {
                const json = JSON.parse(text) as { message?: string; error?: string };
                errorMessage = json.message ?? json.error ?? text;
            } catch {
                if (text) errorMessage = text;
            }
        } catch { /* ignore */ }

        throw new Error(`작곡 요청 실패 (${response.status}): ${errorMessage}`);
    }

    return response.json().catch(() => ({}) as CompositionResponse);
}

export function buildCompositionBody(answers: CompositionAnswers): CompositionRequestBody {
    const referenceVisual = answers.referenceVisual;
    const isBase64 = referenceVisual?.startsWith("data:");

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
