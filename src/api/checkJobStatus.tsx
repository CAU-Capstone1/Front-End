import { getAuthHeaders } from "../utils/auth";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD ? "http://3.36.255.180:8080/api" : "/api");
export type JobStatus = "QUEUED" | "PROCESSING" | "SUCCEEDED" | "FAILED" | string;
export type JobStatusResponse = {
    jobId: string;
    status: JobStatus;
    progress: number;
    errorMessage: string | null;
    musicUrl: string | null;
};
export async function checkJobStatus(jobId: string): Promise<JobStatusResponse> {
    const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
    };
    const encodedJobId = encodeURIComponent(jobId);
    const url = `${API_BASE_URL}/job/${encodedJobId}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: headers,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Job 상태 확인 실패 (${response.status}): ${errorText}`);
        }
        const data: JobStatusResponse = await response.json();
        return data;
    } catch (error) {
        console.error("❌ Job 상태 확인 실패:", error);
        throw new Error(
            `Job 상태 확인 실패: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}
export async function pollJobUntilComplete(
    jobId: string,
    options: {
        intervalMs?: number; 
        maxAttempts?: number; 
        onStatusUpdate?: (status: JobStatusResponse) => void; 
    } = {}
): Promise<JobStatusResponse> {
    const {
        intervalMs = 3000, 
        maxAttempts = 100, 
        onStatusUpdate,
    } = options;
    console.log(`🔄 Job 완료까지 폴링 시작: ${jobId} (간격: ${intervalMs}ms, 최대: ${maxAttempts}회)`);
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const status = await checkJobStatus(jobId);
            console.log(`📊 Job 상태 (${attempt}/${maxAttempts}):`, status);
            if (onStatusUpdate) {
                onStatusUpdate(status);
            }
            const jobStatus = status.status?.toUpperCase();
            if (jobStatus === "SUCCEEDED") {
                console.log("✅ Job 완료!");
                if (!status.musicUrl) {
                    console.warn("⚠️ Job이 완료되었지만 musicUrl이 null입니다.");
                }
                return status;
            }
            if (jobStatus === "FAILED") {
                const errorMessage = status.errorMessage || "Job이 실패했습니다.";
                throw new Error(`Job 실패: ${errorMessage}`);
            }
            if (jobStatus === "QUEUED" || jobStatus === "PROCESSING") {
                console.log(`⏳ Job 진행 중... (${jobStatus}, 진행률: ${status.progress}%)`);
                await new Promise((resolve) => setTimeout(resolve, intervalMs));
                continue;
            }
            console.warn(`⚠️ 알 수 없는 Job 상태: ${jobStatus}, 계속 대기합니다.`);
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
        } catch (error) {
            if (error instanceof Error && error.message.includes("403")) {
                console.error("❌ 인증/권한 오류 (403): Job 상태를 확인할 수 없습니다.");
                throw new Error("인증이 필요하거나 권한이 없습니다. 로그인 상태를 확인해주세요.");
            }
            if (attempt < maxAttempts) {
                console.warn(`⚠️ Job 상태 확인 실패 (재시도 ${attempt}/${maxAttempts}):`, error);
                await new Promise((resolve) => setTimeout(resolve, intervalMs));
                continue;
            }
            throw error;
        }
    }
    throw new Error(`Job이 시간 내에 완료되지 않았습니다. (${maxAttempts}회 시도)`);
}
