import { getAuthHeaders } from "../utils/auth";

export type JobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | string;

export type JobStatusResponse = {
    PublicJobId?: string;
    status?: JobStatus;
    audioUrl?: string;
    musicUrl?: string;
    fileUrl?: string;
    url?: string;
    audio_url?: string;
    music_url?: string;
    error?: string;
    [key: string]: unknown;
};

/**
 * Job 상태를 확인하는 함수
 * @param jobId - 확인할 Job ID
 * @returns Job 상태 정보
 */
export async function checkJobStatus(jobId: string): Promise<JobStatusResponse> {
    const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
    };

    console.log("🔍 Job 상태 확인:", jobId);

    try {
        // Job ID 인코딩 (URL 안전하게 처리)
        const encodedJobId = encodeURIComponent(jobId);
        
        // 백엔드에서 제공하는 실제 API 경로를 우선 시도
        const possiblePaths = [
            `/api/jobs/${encodedJobId}`,        // JobController - 우선 시도
            `/api/compose/status/${encodedJobId}`, // ProcessController - 두 번째 시도
            `/api/jobs/${jobId}`,               // 인코딩 안 한 버전 (fallback)
            `/api/compose/status/${jobId}`,     // 인코딩 안 한 버전 (fallback)
            `/api/compose/job/${encodedJobId}`, // 기타 가능한 경로
            `/api/job/${encodedJobId}/status`, // 기타 가능한 경로
        ];

        let lastError: Error | null = null;

        for (const path of possiblePaths) {
            try {
                console.log(`🔍 Job 상태 확인 시도: ${path}`);
                const response = await fetch(path, {
                    method: "GET",
                    headers: headers,
                });

                console.log(`📥 응답 상태: ${response.status} ${response.statusText} (${path})`);

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Job 상태 확인 성공 (${path}):`, data);
                    return data;
                } else {
                    // 404나 405는 예상 가능한 오류 (해당 경로가 없을 수 있음)
                    if (response.status === 404 || response.status === 405) {
                        console.log(`ℹ️ ${path} - 해당 경로 없음 (${response.status})`);
                        continue; // 다음 경로 시도
                    } else {
                        // 다른 오류는 로그에 기록
                        const errorText = await response.text().catch(() => "");
                        console.warn(`⚠️ ${path} - 오류 (${response.status}):`, errorText);
                    }
                }
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.warn(`⚠️ ${path} - 네트워크 오류:`, error);
            }
        }

        // 모든 경로 실패 시, compose 엔드포인트에 GET 요청으로 jobId 전달 시도
        try {
            const response = await fetch(`/api/compose?jobId=${encodeURIComponent(jobId)}`, {
                method: "GET",
                headers: headers,
            });

            if (response.ok) {
                const data = await response.json();
                console.log("✅ Job 상태 확인 성공 (GET /api/compose):", data);
                return data;
            }
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
        }

        // GET 실패 시, POST로 jobId를 포함한 요청 시도
        try {
            const response = await fetch("/api/compose", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ jobId: jobId }),
            });

            if (response.ok || response.status === 202) {
                const data = await response.json();
                console.log("✅ Job 상태 확인 성공 (POST /api/compose with jobId):", data);
                return data;
            }
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
        }

        // 모든 방법 실패 시, 더 자세한 오류 정보 제공
        console.error("❌ 모든 Job 상태 확인 경로 실패");
        console.error("❌ 시도한 경로들:", possiblePaths);
        console.error("❌ Job ID:", jobId);
        
        throw lastError || new Error(`Job 상태를 확인할 수 없습니다. 서버에 Job 상태 확인 API가 없거나 다른 경로를 사용하는 것 같습니다. Job ID: ${jobId}`);
    } catch (error) {
        console.error("❌ Job 상태 확인 실패:", error);
        throw new Error(`Job 상태 확인 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Job이 완료될 때까지 폴링하는 함수
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
            
            // 완료 상태 확인 (다양한 완료 상태 지원)
            if (jobStatus === "COMPLETED" || jobStatus === "SUCCESS" || jobStatus === "DONE" || jobStatus === "FINISHED") {
                console.log("✅ Job 완료!");
                
                // 완료되었지만 음악 URL이 없을 수 있음 (서버가 별도로 제공할 수 있음)
                const hasMusicUrl = status.audioUrl || status.musicUrl || status.fileUrl || 
                                   status.url || status.audio_url || status.music_url;
                
                if (!hasMusicUrl) {
                    console.warn("⚠️ Job이 완료되었지만 음악 URL이 없습니다. 응답:", status);
                }
                
                return status;
            }

            // 실패 상태 확인
            if (jobStatus === "FAILED" || jobStatus === "ERROR" || jobStatus === "FAILURE") {
                const errorMessage = status.error || status.errorMessage || "Job이 실패했습니다.";
                throw new Error(`Job 실패: ${errorMessage}`);
            }

            // QUEUED 또는 PROCESSING 상태면 계속 대기
            if (jobStatus === "QUEUED" || jobStatus === "PROCESSING" || jobStatus === "IN_PROGRESS" || jobStatus === "RUNNING") {
                console.log(`⏳ Job 진행 중... (${jobStatus})`);
                // progress 정보가 있으면 표시
                if (status.progress !== undefined) {
                    console.log(`📊 진행률: ${status.progress}%`);
                }
                // 다음 폴링까지 대기
                await new Promise((resolve) => setTimeout(resolve, intervalMs));
                continue;
            }

            // 알 수 없는 상태 - 계속 대기 (서버가 새로운 상태를 추가했을 수 있음)
            console.warn(`⚠️ 알 수 없는 Job 상태: ${jobStatus}, 계속 대기합니다.`);
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
        } catch (error) {
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

