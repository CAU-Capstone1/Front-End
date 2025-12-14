import { getAuthHeaders } from "../utils/auth";

// API 기본 URL (환경 변수로 설정 가능)
// 프로덕션에서는 절대 경로 사용, 개발 환경에서는 프록시 사용
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD ? "http://3.36.255.180:8080/api" : "/api");

/**
 * 백엔드 JobStatus enum에 대응하는 타입
 */
export type JobStatus = "QUEUED" | "PROCESSING" | "SUCCEEDED" | "FAILED" | string;

/**
 * 백엔드 JobStatusResponse DTO 구조
 * public record JobStatusResponse(
 *     String jobId,
 *     JobStatus status,
 *     double progress,
 *     String errorMessage,
 *     String musicUrl
 * )
 */
export type JobStatusResponse = {
    jobId: string;
    status: JobStatus;
    progress: number;
    errorMessage: string | null;
    musicUrl: string | null;
};

/**
 * Job 상태를 확인하는 함수
 * GET /api/job/{jobId}
 * 
 * @param jobId - 확인할 Job ID
 * @returns Job 상태 정보 (백엔드 DTO 구조)
 */
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

/**
 * Job이 완료될 때까지 폴링하는 함수
 * 
 * @param jobId - 확인할 Job ID
 * @param options - 폴링 옵션
 * @returns 완료된 Job 결과
 */
export async function pollJobUntilComplete(
    jobId: string,
    options: {
        intervalMs?: number; // 폴링 간격 (기본: 3초)
        maxAttempts?: number; // 최대 시도 횟수 (기본: 100회 = 약 5분)
        onStatusUpdate?: (status: JobStatusResponse) => void; // 상태 업데이트 콜백
    } = {}
): Promise<JobStatusResponse> {
    const {
        intervalMs = 3000, // 3초마다 확인
        maxAttempts = 100, // 최대 100번 시도 (약 5분)
        onStatusUpdate,
    } = options;

    console.log(`🔄 Job 완료까지 폴링 시작: ${jobId} (간격: ${intervalMs}ms, 최대: ${maxAttempts}회)`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const status = await checkJobStatus(jobId);
            
            console.log(`📊 Job 상태 (${attempt}/${maxAttempts}):`, status);

            // 상태 업데이트 콜백 호출
            if (onStatusUpdate) {
                onStatusUpdate(status);
            }

            // 완료 상태 확인
            const jobStatus = status.status?.toUpperCase();
            
            // SUCCEEDED 상태면 완료
            if (jobStatus === "SUCCEEDED") {
                console.log("✅ Job 완료!");
                
                if (!status.musicUrl) {
                    console.warn("⚠️ Job이 완료되었지만 musicUrl이 null입니다.");
                }
                
                return status;
            }

            // 실패 상태 확인
            if (jobStatus === "FAILED") {
                const errorMessage = status.errorMessage || "Job이 실패했습니다.";
                throw new Error(`Job 실패: ${errorMessage}`);
            }

            // QUEUED 또는 PROCESSING 상태면 계속 대기
            if (jobStatus === "QUEUED" || jobStatus === "PROCESSING") {
                console.log(`⏳ Job 진행 중... (${jobStatus}, 진행률: ${status.progress}%)`);
                // 다음 폴링까지 대기
                await new Promise((resolve) => setTimeout(resolve, intervalMs));
                continue;
            }

            // 알 수 없는 상태 - 계속 대기
            console.warn(`⚠️ 알 수 없는 Job 상태: ${jobStatus}, 계속 대기합니다.`);
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
        } catch (error) {
            // 403 Forbidden 에러는 인증/권한 문제이므로 재시도하지 않음
            if (error instanceof Error && error.message.includes("403")) {
                console.error("❌ 인증/권한 오류 (403): Job 상태를 확인할 수 없습니다.");
                throw new Error("인증이 필요하거나 권한이 없습니다. 로그인 상태를 확인해주세요.");
            }
            
            // 네트워크 오류 등은 무시하고 계속 시도
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

