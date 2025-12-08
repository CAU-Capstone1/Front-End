const VALUE_LABEL_MAP: Record<string, string> = {
    classical: "클래식",
    orchestra: "오케스트라", // 하위 호환성 유지
    hiphop: "힙합",
    rock: "록",
    sageuk: "사극풍",
    peaceful: "평화로운",
    dreamy: "몽환적인",
    exciting: "신나는",
    intense: "긴박한",
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

