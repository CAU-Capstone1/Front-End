import { useCallback, useState } from "react";
import { checkJobStatus, type JobStatusResponse } from "../api/checkJobStatus";

export function useJobPolling() {
    const [jobStatus, setJobStatus] = useState<string | null>(null);
    const [jobProgress, setJobProgress] = useState<number | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const check = useCallback(async (jobId: string): Promise<JobStatusResponse | null> => {
        setIsChecking(true);
        try {
            const result = await checkJobStatus(jobId);
            setJobStatus(result.status);
            setJobProgress(result.progress);
            return result;
        } catch (error) {
            console.error("Job 상태 확인 실패:", error);
            return null;
        } finally {
            setIsChecking(false);
        }
    }, []);

    return { jobStatus, jobProgress, isChecking, check };
}
