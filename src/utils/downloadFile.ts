export async function downloadMusicFile(url: string, filename: string): Promise<void> {
    const sanitized = filename.endsWith(".mp3") ? filename : `${filename}.mp3`;

    try {
        const res = await fetch(url, { mode: "cors" });
        if (res.ok) {
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            triggerAnchorClick(objectUrl, sanitized);
            URL.revokeObjectURL(objectUrl);
            return;
        }
    } catch {
        // CORS blocked — fall through to direct link
    }

    triggerAnchorClick(url, sanitized);
}

function triggerAnchorClick(href: string, filename: string): void {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.style.cssText = "position:fixed;top:-9999px";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
