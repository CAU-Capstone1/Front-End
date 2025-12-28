const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD ? "http://3.36.255.180:8080/api" : "/api");
export async function uploadAudio(file: File | Blob, fileName?: string) {
    const formData = new FormData();
    formData.append("file", file, fileName ?? (file as File).name ?? `audio-${Date.now()}.webm`);
    const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
        cache: "no-store",
        redirect: "follow",
        headers: { Accept: "application/json, text/plain, */*" },
    });
    const ct = res.headers.get("content-type") || "";
    let data:
        | Record<string, unknown>
        | { raw: string }
        | { parseError: string }
        | null = null;
    try {
        data = ct.includes("application/json") ? await res.json() : { raw: await res.text() };
    } catch (e) {
        data = { parseError: String(e) };
    }
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${JSON.stringify(data)}`);
    }
    return { status: res.status, data };
}
