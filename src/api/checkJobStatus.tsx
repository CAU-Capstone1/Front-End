import { API_BASE_URL } from "../lib/apiClient";
import { getAuthHeaders } from "../utils/auth";

export type KnownJobStatus = "QUEUED" | "PROCESSING" | "SUCCEEDED" | "FAILED";
// (string & Record<never, never>) preserves literal intellisense while allowing unknown values
export type JobStatus = KnownJobStatus | (string & Record<never, never>);

export type JobStatusResponse = {
    jobId: string;
    status: JobStatus;
    progress: number;
    errorMessage: string | null;
    musicUrl: string | null;
};

export async function checkJobStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/job/${encodeURIComponent(jobId)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Job 상태 확인 실패 (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<JobStatusResponse>;
}

export async function pollJobUntilComplete(
    jobId: string,
    options: {
        intervalMs?: number;
        maxAttempts?: number;
        onStatusUpdate?: (status: JobStatusResponse) => void;
    } = {},
): Promise<JobStatusResponse> {
    const { intervalMs = 3000, maxAttempts = 100, onStatusUpdate } = options;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const status = await checkJobStatus(jobId);

            if (onStatusUpdate) onStatusUpdate(status);

            const normalized = status.status.toUpperCase();

            if (normalized === "SUCCEEDED") return status;

            if (normalized === "FAILED") {
                throw new Error(`Job 실패: ${status.errorMessage ?? "알 수 없는 오류"}`);
            }

            await new Promise((resolve) => setTimeout(resolve, intervalMs));
        } catch (error) {
            if (error instanceof Error && error.message.includes("403")) {
                throw new Error("인증이 필요하거나 권한이 없습니다. 로그인 상태를 확인해주세요.");
            }
            if (attempt < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, intervalMs));
                continue;
            }
            throw error;
        }
    }

    throw new Error(`Job이 시간 내에 완료되지 않았습니다. (${maxAttempts}회 시도)`);
}
