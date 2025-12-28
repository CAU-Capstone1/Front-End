const VALUE_LABEL_MAP: Record<string, string> = {
    classical: "클래식",
    orchestra: "오케스트라", 
    hiphop: "힙합",
    rock: "록",
    sageuk: "사극풍", 
    jazz: "재즈",
    grand: "웅장한",
    luxurious: "고급스러운",
    poignant: "애잔한",
    calm: "잔잔한",
    confident: "당당한",
    rough: "거친",
    relaxed: "느긋한",
    explosive: "폭발적인",
    rebellious: "반항적인",
    lonely: "쓸쓸한",
    anthemic: "희망찬",
    romantic: "로맨틱한",
    solitary: "외로운",
    swingy: "경쾌한",
    refined: "세련된",
    elegant: "우아한",
    tragic: "비극적인",
    serene: "평온한",
    swagger: "스웨그 넘치는",
    gritty: "긴장감 있는",
    chill: "칠한",
    intense: "강렬한",
    melancholic: "우울한",
    sophisticated: "지적인",
    dreamy: "몽환적인",
    exciting: "신나는",
    sad: "슬픈",
    violin: "바이올린",
    piano: "피아노",
    guitar: "기타",
    drum: "드럼",
    "very-fast": "아주 빠르게",
    fast: "빠르게",
    medium: "보통",
    slow: "느리게",
    "very-slow": "아주 느리게",
};
export function formatAnswerValue(value: string | null, suffix?: string) {
    if (!value) return "-";
    const mapped = VALUE_LABEL_MAP[value] ?? value;
    return suffix ? `${mapped}${suffix}` : mapped;
}
export function humanReadableAnswers(values: Array<string | null>) {
    return values
        .map((value) => (value ? formatAnswerValue(value) : null))
        .filter((value): value is string => Boolean(value && value !== "-"))
        .join(", ");
}
export default VALUE_LABEL_MAP;
