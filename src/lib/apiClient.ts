export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.PROD ? "http://3.36.255.180:8080/api" : "/api");

export async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const contentType = res.headers.get("content-type");
        let message: string;
        try {
            if (contentType?.includes("application/json")) {
                const body = (await res.json()) as { message?: string; error?: string };
                message = body.message ?? body.error ?? res.statusText;
            } else {
                message = (await res.text()) || res.statusText;
            }
        } catch {
            message = res.statusText || `HTTP ${res.status}`;
        }
        throw new Error(message);
    }
    return res.json() as Promise<T>;
}

export async function fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout = 10000,
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error("요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.");
        }
        throw error;
    }
}
