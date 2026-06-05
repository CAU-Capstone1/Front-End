import { useCallback, useRef, useState } from "react";
import { isLoggedIn } from "../utils/auth";
import { getAllSavedMusic, saveMusic, updateMusicName } from "../utils/musicStorage";
import { getAllAnswers } from "../utils/compositionSession";

function getDefaultMusicName(): string {
    if (!isLoggedIn()) return "음악 1";
    try {
        const pattern = /^음악\s+(\d+)$/;
        const maxNum = getAllSavedMusic().reduce((max, m) => {
            const match = m.name.match(pattern);
            return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 0);
        return `음악 ${maxNum + 1}`;
    } catch {
        return "음악 1";
    }
}

function buildCompositionData() {
    const a = getAllAnswers();
    return {
        style: a.style,
        mood: a.mood,
        instrument: a.instrument,
        key: a.key,
        duration: a.duration,
        tempo: a.tempo,
        hummingStart: a.hummingStart,
        hummingMain: a.hummingMain,
        hummingEnd: a.hummingEnd,
        referenceVisual: a.referenceVisual,
    };
}

export function useMusicAutoSave() {
    const hasAutoSavedRef = useRef(false);
    const [savedMusicId, setSavedMusicId] = useState<string | null>(null);
    const [musicName, setMusicName] = useState("");

    // Uses ref so dep array stays empty — no stale closure risk
    const autoSave = useCallback((url: string, responseJson: string | null): string | null => {
        if (hasAutoSavedRef.current || !isLoggedIn() || !url) return null;
        try {
            const defaultName = getDefaultMusicName();
            const saved = saveMusic({
                name: defaultName,
                compositionData: buildCompositionData(),
                composeResponse: responseJson,
            });
            hasAutoSavedRef.current = true;
            setSavedMusicId(saved.id);
            setMusicName(defaultName);
            return saved.id;
        } catch {
            return null;
        }
    }, []);

    const saveManually = useCallback((name: string, responseJson: string | null): string | null => {
        if (!isLoggedIn()) return null;
        try {
            const saved = saveMusic({
                name,
                compositionData: buildCompositionData(),
                composeResponse: responseJson,
            });
            hasAutoSavedRef.current = true;
            setSavedMusicId(saved.id);
            setMusicName(name);
            return saved.id;
        } catch {
            return null;
        }
    }, []);

    const rename = useCallback((id: string, name: string): boolean => {
        return updateMusicName(id, name);
    }, []);

    return { savedMusicId, musicName, setMusicName, autoSave, saveManually, rename };
}
