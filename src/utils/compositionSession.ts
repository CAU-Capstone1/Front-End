/*
이 파일 역할

1. 세션 스토리지 관리
sessionStorage 키를 한곳(STORAGE_KEYS)에 모아두고, setAnswer, getAnswer, removeAnswer 같은 함수로 접근을 캡슐화함

2. 전체 값 조회/초기화
getAllAnswers()로 현재까지 입력한 장르·무드·허밍 경로 등을 한 번에 가져오고, resetAnswers()로 초기화(및 compose:lastResponse 삭제)

3. 각 질문 페이지와 리뷰/결과 페이지가 이 함수들을 사용해서 선택 내용을 저장하고 불러옴
*/

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
    if (trimmed) {
        storage.setItem(STORAGE_KEYS[key], trimmed);
      } else {
        storage.removeItem(STORAGE_KEYS[key]);
      }}

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

