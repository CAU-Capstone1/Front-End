import { useCallback, useEffect, useRef, useState } from "react";

export function useAudioPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentUrlRef = useRef<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const toggle = useCallback(async (url: string): Promise<void> => {
        const current = audioRef.current;

        // Same URL and currently playing → pause
        if (currentUrlRef.current === url && current && !current.paused) {
            current.pause();
            return;
        }

        // New URL or no audio object → create fresh Audio
        if (currentUrlRef.current !== url || !current) {
            current?.pause();
            const audio = new Audio(url);
            audio.addEventListener("play", () => setIsPlaying(true));
            audio.addEventListener("pause", () => setIsPlaying(false));
            audio.addEventListener("ended", () => setIsPlaying(false));
            audio.addEventListener("error", () => setIsPlaying(false));
            audioRef.current = audio;
            currentUrlRef.current = url;
        }

        await audioRef.current!.play();
    }, []);

    useEffect(() => {
        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, []);

    return { isPlaying, toggle };
}
