export const STORAGE_KEYS = {
    style: "compose:style",
    mood: "compose:mood",
    key: "compose:key",
    duration: "compose:duration",
    instrument: "compose:instrument",
    tempo: "compose:tempo",
    hummingPath: "compose:hummingPath",
} as const;

export type CompositionAnswerKey = keyof typeof STORAGE_KEYS;

export type CompositionAnswers = {
    [K in CompositionAnswerKey]?: string | null;
};

const storage = typeof window !== "undefined" ? window.sessionStorage : undefined;

export function setAnswer(key: CompositionAnswerKey, value: string) {
    if (!storage) return;
    const trimmed = value.trim();
    trimmed ? storage.setItem(STORAGE_KEYS[key], trimmed) : storage.removeItem(STORAGE_KEYS[key]);
}

export function getAnswer(key: CompositionAnswerKey) {
    if (!storage) return null;
    return storage.getItem(STORAGE_KEYS[key]);
}

export function removeAnswer(key: CompositionAnswerKey) {
    if (!storage) return;
    storage.removeItem(STORAGE_KEYS[key]);
}

export function getAllAnswers(): CompositionAnswers {
    if (!storage) return {};
    return Object.keys(STORAGE_KEYS).reduce<CompositionAnswers>((acc, currentKey) => {
        const typedKey = currentKey as CompositionAnswerKey;
        acc[typedKey] = getAnswer(typedKey);
        return acc;
    }, {});
}

export function resetAnswers() {
    if (!storage) return;
    (Object.keys(STORAGE_KEYS) as CompositionAnswerKey[]).forEach((key) => storage.removeItem(STORAGE_KEYS[key]));
    storage.removeItem("compose:lastResponse");
}

