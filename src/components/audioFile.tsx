import { useCallback, useMemo, useRef, useState } from "react";
import Button from "./button";
import { uploadAudio } from "../api/uploadAudio";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";
import type { CompositionAnswerKey } from "../utils/compositionSession";

const MAX_AUDIO_SIZE_MB = 50;

const AUDIO_SEGMENTS = [
    { id: "start", label: "시작 멜로디", helper: "도입부나 전주 느낌" },
    { id: "main", label: "메인 멜로디", helper: "코러스, 후렴 등 핵심" },
    { id: "end", label: "끝 멜로디", helper: "아웃트로, 마무리" },
] as const;

type SegmentId = typeof AUDIO_SEGMENTS[number]["id"];

type SegmentState = {
    file: File | null;
    previewURL: string | null;
    isUploading: boolean;
    status: string;
    storedName: string | null;
};

const SEGMENT_KEY_MAP: Record<SegmentId, CompositionAnswerKey> = {
    start: "hummingStart",
    main: "hummingMain",
    end: "hummingEnd",
};

export default function AudioFileUploader() {
    const [segmentState, setSegmentState] = useState<Record<SegmentId, SegmentState>>(() => ({
        start: {
            file: null,
            previewURL: null,
            isUploading: false,
            status: "",
            storedName: getAnswer("hummingStart") ?? null,
        },
        main: {
            file: null,
            previewURL: null,
            isUploading: false,
            status: "",
            storedName: getAnswer("hummingMain") ?? null,
        },
        end: {
            file: null,
            previewURL: null,
            isUploading: false,
            status: "",
            storedName: getAnswer("hummingEnd") ?? null,
        },
    }));

    const startInputRef = useRef<HTMLInputElement | null>(null);
    const mainInputRef = useRef<HTMLInputElement | null>(null);
    const endInputRef = useRef<HTMLInputElement | null>(null);

    const segmentInputRefs = useMemo(
        () => ({
            start: startInputRef,
            main: mainInputRef,
            end: endInputRef,
        }),
        [],
    );

    const validateFile = (file: File, maxSize: number, typePrefix: string) => {
        if (!file.type.startsWith(typePrefix)) {
            alert(`${typePrefix.replace("/", "")} 파일만 업로드할 수 있어요.`);
            return false;
        }

        if (file.size > maxSize * 1024 * 1024) {
            alert(`파일이 너무 큽니다. 최대 ${maxSize}MB까지 업로드할 수 있어요.`);
            return false;
        }

        return true;
    };

    const handleSegmentFiles = useCallback(
        (segmentId: SegmentId, files: FileList | null) => {
            if (!files?.length) return;
            const candidate = files[0];
            if (!validateFile(candidate, MAX_AUDIO_SIZE_MB, "audio")) return;

            setSegmentState((prev) => {
                const previousPreview = prev[segmentId].previewURL;
                if (previousPreview) URL.revokeObjectURL(previousPreview);

                return {
                    ...prev,
                    [segmentId]: {
                        ...prev[segmentId],
                        file: candidate,
                        previewURL: URL.createObjectURL(candidate),
                        status: "",
                    },
                };
            });
        },
        [],
    );

    const uploadSegment = async (segmentId: SegmentId) => {
        const current = segmentState[segmentId];
        if (!current.file) return;

        setSegmentState((prev) => ({
            ...prev,
            [segmentId]: {
                ...prev[segmentId],
                isUploading: true,
                status: "업로드 중...",
            },
        }));

        try {
            await uploadAudio(current.file, `${segmentId}-${current.file.name}`);
            setAnswer(SEGMENT_KEY_MAP[segmentId], current.file.name);
            setSegmentState((prev) => ({
                ...prev,
                [segmentId]: {
                    ...prev[segmentId],
                    isUploading: false,
                    status: "업로드 완료 ✅",
                    storedName: current.file?.name ?? prev[segmentId].storedName,
                },
            }));
        } catch (error) {
            console.error(error);
            setSegmentState((prev) => ({
                ...prev,
                [segmentId]: {
                    ...prev[segmentId],
                    isUploading: false,
                    status: "업로드 실패 ❌ 다시 시도해주세요.",
                },
            }));
        }
    };

    const resetSegment = (segmentId: SegmentId) => {
        setSegmentState((prev) => {
            const previousPreview = prev[segmentId].previewURL;
            if (previousPreview) URL.revokeObjectURL(previousPreview);
            return {
                ...prev,
                [segmentId]: {
                    file: null,
                    previewURL: null,
                    isUploading: false,
                    status: "",
                    storedName: null,
                },
            };
        });
        removeAnswer(SEGMENT_KEY_MAP[segmentId]);
        
        // input 요소의 value를 리셋하여 같은 파일을 다시 선택할 수 있도록 함
        const inputRef = segmentInputRefs[segmentId].current;
        if (inputRef) {
            inputRef.value = "";
        }
    };

    return (
        <section className="w-full">
            <div className="rounded-[2.5rem] border-4 border-black/10 bg-gradient-to-bl from-white via-[var(--bg-secondary)] to-[#ffe9f2] px-8 py-10 shadow-[0_25px_0_rgba(46,31,39,0.08)] sm:px-12">
                <div className="space-y-3 text-left">
                    <p className="text-m uppercase tracking-[0.35em] text-[var(--accent-amber)]">melody kit</p>
                    <h2 className="text-[2.2rem] font-semibold text-[var(--text-primary)] leading-tight">
                        필요한 구간만 골라 허밍을 업로드해요
                    </h2>
                    <p className="text-m text-[var(--text-muted)]">
                        메인 멜로디는 필수로 올려야 음악이 만들어져요. 시작, 끝 멜로디는 올리고 싶은 것 만 올려요.
                    </p>
                </div>

                <div className="mt-10 grid gap-5 sm:grid-cols-3">
                    {AUDIO_SEGMENTS.map((segment) => {
                        const state = segmentState[segment.id]
                        return (
                            <div
                                key={segment.id}
                                className={`flex h-full flex-col gap-4 rounded-[1.8rem] border-2 px-5 py-6 text-center shadow-[0_12px_0_rgba(46,31,39,0.08)] transition ${
                                    state.file || state.storedName
                                        ? "border-[var(--accent-amber)] bg-white"
                                        : "border-black/10 bg-white/70"
                                }`}
                            >
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{segment.label}</h3>
                                    <p className="text-xs text-[var(--text-muted)]">{segment.helper}</p>
                                </div>
                                {!(state.file || state.storedName) && (
                                    <button
                                        type="button"
                                        onClick={() => segmentInputRefs[segment.id].current?.click()}
                                        className="my-btn rounded-[1.2rem] border-2 border-dashed border-[var(--accent-rose)] bg-white px-3 py-3 text-sm font-semibold text-[var(--accent-rose)] shadow-[0_8px_0_rgba(242,137,130,0.18)] transition hover:-translate-y-[2px]"
                                    >
                                        파일 선택
                                    </button>
                                )}

                                {(state.file || state.storedName) && (
                                    <div className="space-y-2 text-sm">
                                        <p className="font-semibold text-[var(--text-primary)]">
                                            {(state.file && state.file.name) || state.storedName}
                                        </p>
                                        {state.file && state.previewURL && (
                                            <audio src={state.previewURL} controls className="mx-auto w-full" />
                                        )}
                                    </div>
                                )}

                                {(state.file || state.storedName) && (
                                    <div className="flex flex-col gap-2">
                                        <Button onClick={() => uploadSegment(segment.id)} disabled={!state.file || state.isUploading}>
                                            {state.isUploading ? "업로드 중..." : "업로드하기"}
                                        </Button>
                                        <Button variant="danger" onClick={() => resetSegment(segment.id)}>
                                            삭제하기
                                        </Button>
                                        {state.status && (
                                            <p className="text-xs font-semibold text-[var(--accent-rose)]">{state.status}</p>
                                        )}
                                    </div>
                                )}

                                <input
                                    ref={segmentInputRefs[segment.id]}
                                    type="file"
                                    accept="audio/*"
                                    className="hidden"
                                    onChange={(event) => handleSegmentFiles(segment.id, event.target.files)}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
