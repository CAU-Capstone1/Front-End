export const STORAGE_KEYS = {
    style: "compose:style",
    mood: "compose:mood",
    instrument: "compose:instrument",
    key: "compose:key",
    duration: "compose:duration",
    tempo: "compose:tempo",
    hummingStart: "compose:hummingStart",
    hummingMain: "compose:hummingMain",
    hummingEnd: "compose:hummingEnd",
    referenceVisual: "compose:referenceVisual",
    referenceVisualName: "compose:referenceVisualName",
} as const;
export type CompositionAnswerKey = keyof typeof STORAGE_KEYS;
export type CompositionAnswers = {
    [K in CompositionAnswerKey]?: string | null;
};
const storage = typeof window !== "undefined" ? window.sessionStorage : undefined;
export function setAnswer(key: CompositionAnswerKey, value: string) {
    if (!storage) return;
    const trimmed = value.trim();
    if (trimmed) {
        storage.setItem(STORAGE_KEYS[key], trimmed);
    } else {
        storage.removeItem(STORAGE_KEYS[key]);
    }
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
