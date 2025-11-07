import { useCallback, useRef, useState } from "react";
import Button from "./button";
import { uploadAudio } from "../api/uploadAudio";
import { removeAnswer, setAnswer } from "../utils/compositionSession";

const MAX_AUDIO_SIZE_MB = 50;
const MAX_IMAGE_SIZE_MB = 20;

export default function AudioFileUploader() {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [imageURL, setImageURL] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);

    const audioInputRef = useRef<HTMLInputElement | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);

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

    const handleAudioFiles = useCallback((files: FileList | null) => {
        if (!files?.length) return;
        const candidate = files[0];
        if (!validateFile(candidate, MAX_AUDIO_SIZE_MB, "audio")) return;

        setAudioFile(candidate);
        setAudioURL(URL.createObjectURL(candidate));
        setStatus("");
    }, []);

    const handleImageFiles = useCallback((files: FileList | null) => {
        if (!files?.length) return;
        const candidate = files[0];
        if (!validateFile(candidate, MAX_IMAGE_SIZE_MB, "image")) return;

        setImageFile(candidate);
        setImageURL(URL.createObjectURL(candidate));
        setStatus("");
    }, []);

    const uploadAudioFile = async () => {
        if (!audioFile) return;
        setIsUploading(true);
        setStatus("허밍 업로드 중...");

        try {
            const result = await uploadAudio(audioFile, audioFile.name);
            setStatus("허밍 업로드 완료 ✅");
            setAnswer("hummingPath", audioFile.name);
            console.log("🎵 Audio uploaded", result);
        } catch (error) {
            console.error(error);
            setStatus("허밍 업로드 실패 ❌ 다시 시도해주세요.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <section className="w-full max-w-5xl mx-auto rounded-[2.5rem] border-4 border-black/10 bg-gradient-to-br from-[var(--bg-secondary)] via-white to-[#fce4ef] px-8 py-12 shadow-[0_25px_0_rgba(46,31,39,0.08)] sm:px-12 sm:py-16">
            <div className="flex flex-col gap-12">
                <header className="flex flex-col-reverse gap-8 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3 text-left">
                        <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent-rose)]">welcome</p>
                        <p className="text-3xl sm:text-[2.8rem] font-bold leading-tight text-[var(--text-primary)]">
                            지금부터 음악을<br />만들어 볼까요?
                        </p>
                        <p className="text-base text-[var(--text-muted)]">
                            허밍이나 레퍼런스 이미지를 업로드하면 AI가 당신만의 음악을 만들어드릴게요.
                        </p>
                    </div>

                    <Button variant="outline" className="self-end sm:self-start text-sm">
                        로그인
                    </Button>
                </header>

                <div className="grid gap-4 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => audioInputRef.current?.click()}
                        className="group relative flex h-48 w-full flex-col justify-between rounded-[2rem] border-2 border-[var(--accent-rose)] bg-white p-6 text-left shadow-[0_12px_0_rgba(242,137,130,0.15)] transition hover:-translate-y-1 hover:shadow-[0_18px_0_rgba(242,137,130,0.24)]"
                    >
                        <div className="space-y-1">
                            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--accent-rose)]">step 1</p>
                            <h2 className="text-3xl font-bold text-[var(--text-primary)]">허밍 업로드</h2>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">
                            잠깐 허밍만 해도 좋아요. 최대 {MAX_AUDIO_SIZE_MB}MB까지 지원해요.
                        </p>
                        <span className="absolute right-6 bottom-6 text-sm font-semibold text-[var(--accent-rose)] group-hover:translate-x-1 transition-transform">
                            파일 선택 →
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="group relative flex h-48 w-full flex-col justify-between rounded-[2rem] border-2 border-dashed border-[var(--accent-amber)] bg-[#fffaf0] p-6 text-left shadow-[0_12px_0_rgba(246,190,95,0.2)] transition hover:-translate-y-1 hover:shadow-[0_18px_0_rgba(246,190,95,0.28)]"
                    >
                        <div className="space-y-1">
                            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--accent-amber)]">optional</p>
                            <h2 className="text-3xl font-bold text-[var(--text-primary)]">이미지 / 영상 업로드</h2>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">
                            뮤직비디오 레퍼런스나 분위기를 담은 이미지도 함께 업로드해보세요.
                        </p>
                        <span className="absolute right-6 bottom-6 text-sm font-semibold text-[var(--accent-amber)] group-hover:translate-x-1 transition-transform">
                            파일 선택 →
                        </span>
                    </button>
                </div>

                <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(event) => handleAudioFiles(event.target.files)}
                />
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(event) => handleImageFiles(event.target.files)}
                />

                {(audioFile || imageFile) && (
                    <div className="grid gap-6 rounded-[2rem] border-2 border-black/10 bg-white/70 p-6 shadow-[0_18px_0_rgba(46,31,39,0.08)] sm:grid-cols-2">
                        {audioFile && (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-rose)]">허밍</p>
                                    <p className="text-lg font-semibold text-[var(--text-primary)]">{audioFile.name}</p>
                                    <p className="text-sm text-[var(--text-muted)]">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                {audioURL && <audio src={audioURL} controls className="w-full" />}
                                <div className="flex flex-wrap gap-2">
                                    <Button onClick={uploadAudioFile} disabled={isUploading}>
                                        {isUploading ? "업로드 중..." : "허밍 업로드"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setAudioFile(null);
                                            setAudioURL(null);
                                            removeAnswer("hummingPath");
                                        }}
                                    >
                                        다시 선택
                                    </Button>
                                </div>
                            </div>
                        )}

                        {imageFile && (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-rose)]">이미지 · 영상</p>
                                    <p className="text-lg font-semibold text-[var(--text-primary)]">{imageFile.name}</p>
                                    <p className="text-sm text-[var(--text-muted)]">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                {imageURL && (
                                    <div className="overflow-hidden rounded-2xl border border-black/10">
                                        {imageFile.type.startsWith("image/") ? (
                                            <img src={imageURL} alt="업로드 미리보기" className="h-48 w-full object-cover" />
                                        ) : (
                                            <video src={imageURL} controls className="h-48 w-full object-cover" />
                                        )}
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setImageFile(null);
                                            setImageURL(null);
                                        }}
                                    >
                                        다시 선택
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {status && <p className="text-sm font-semibold text-[var(--accent-rose)]">{status}</p>}
            </div>
        </section>
    );
}
