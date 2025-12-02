import { useCallback, useRef, useState } from "react";
import Button from "./button";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";

const MAX_IMAGE_SIZE_MB = 20;

export default function VisualUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("");
    const [storedName, setStoredName] = useState<string | null>(() => getAnswer("referenceVisual") ?? null);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const validateFile = (candidate: File) => {
        if (!candidate.type.startsWith("image/") && !candidate.type.startsWith("video/")) {
            alert("이미지 또는 영상 파일만 업로드할 수 있어요.");
            return false;
        }

        if (candidate.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            alert(`최대 ${MAX_IMAGE_SIZE_MB}MB 이하의 파일만 업로드할 수 있어요.`);
            return false;
        }

        return true;
    };

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files?.length) return;
        const candidate = files[0];
        if (!validateFile(candidate)) return;

        setFile(candidate);
        setStatus("참고 비주얼 준비 완료");
        setAnswer("referenceVisual", candidate.name);
        setStoredName(candidate.name);
        setPreviewURL((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(candidate);
        });
    }, []);

    const reset = () => {
        if (previewURL) URL.revokeObjectURL(previewURL);
        setFile(null);
        setPreviewURL(null);
        setStatus("");
        removeAnswer("referenceVisual");
        setStoredName(null);
    };

    const displayName = file?.name ?? storedName;

    return (
        <section className="rounded-[2.5rem] border-4 border-black/10 bg-gradient-to-tl from-white via-[#fff6da] to-[#ffe9f2] px-8 py-10 shadow-[0_25px_0_rgba(46,31,39,0.08)] sm:px-12">
            <div className="space-y-3 text-left">
                <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent-rose)]">visual ref</p>
                <h2 className="text-[2.2rem] font-semibold text-[var(--text-primary)] leading-tight">
                    참고 이미지나 영상을 추가해보세요
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                    분위기를 설명해 줄 수 있는 레퍼런스를 업로드하면 AI가 음악을 더 풍부하게 이해할 수 있어요.
                </p>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
                {!displayName && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="my-btn flex h-48 w-full max-w-md flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-dashed border-[var(--accent-amber)] bg-white/80 text-center text-[var(--text-primary)] shadow-[0_14px_0_rgba(246,190,95,0.2)] transition hover:-translate-y-[2px]"
                    >
                        <span className="text-sm font-semibold text-[var(--accent-amber)]">이미지 · 영상 선택</span>
                        <span className="text-xs text-[var(--text-muted)]">최대 {MAX_IMAGE_SIZE_MB}MB (JPG / PNG / MP4 등)</span>
                    </button>
                )}

                {displayName && (
                    <div className="w-full max-w-md space-y-3 rounded-[1.8rem] border border-black/10 bg-white/80 p-4 text-sm text-[var(--text-primary)] shadow-[0_12px_0_rgba(46,31,39,0.08)]">
                        <p className="font-semibold">{displayName}</p>
                        {previewURL && (
                            <div className="overflow-hidden rounded-2xl border border-black/10">
                                {file?.type.startsWith("image/") ? (
                                    <img src={previewURL} alt="참고 이미지" className="h-48 w-full object-cover" />
                                ) : (
                                    <video src={previewURL} controls className="h-48 w-full object-cover" />
                                )}
                            </div>
                        )}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <Button variant="danger" onClick={reset}>
                                삭제하기
                            </Button>
                        </div>
                        {status && (
                            <p className="text-xs font-semibold text-[var(--accent-amber)] text-center">
                                {status}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
            />
        </section>
    );
}

