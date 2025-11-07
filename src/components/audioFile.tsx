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
        <section className="w-full max-w-5xl mx-auto bg-white border border-gray-200 rounded-3xl shadow-sm px-8 py-12 sm:px-12 sm:py-16">
            <div className="flex flex-col gap-12">
                <header className="flex flex-col-reverse gap-8 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3 text-left">
                        <p className="text-2xl sm:text-3xl font-semibold text-gray-900">어서오세요</p>
                        <p className="text-2xl sm:text-3xl font-semibold text-gray-900">지금부터 음악을 만들어볼까요?</p>
                        <p className="text-base text-gray-500">
                            허밍이나 레퍼런스 이미지를 업로드하면 AI가 당신만의 음악을 만들어드릴게요.
                        </p>
                    </div>

                    <Button variant="ghost" className="self-end sm:self-start border border-gray-200 text-sm font-medium px-4 py-2 rounded-xl">
                        로그인
                    </Button>
                </header>

                <div className="grid gap-4 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => audioInputRef.current?.click()}
                        className="group relative flex h-44 w-full flex-col justify-between rounded-3xl border-2 border-yellow-400 bg-yellow-300/20 p-6 text-left transition hover:bg-yellow-300/40"
                    >
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-yellow-700">STEP 1</p>
                            <h2 className="text-2xl font-semibold text-gray-900">허밍 업로드</h2>
                        </div>
                        <p className="text-sm text-gray-600">
                            잠깐 허밍만 해도 좋아요. 최대 {MAX_AUDIO_SIZE_MB}MB까지 지원해요.
                        </p>
                        <span className="absolute right-6 bottom-6 text-sm font-semibold text-yellow-700 group-hover:translate-x-1 transition-transform">
                            파일 선택 →
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="group relative flex h-44 w-full flex-col justify-between rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6 text-left transition hover:border-yellow-400 hover:bg-yellow-50"
                    >
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">선택</p>
                            <h2 className="text-2xl font-semibold text-gray-900">이미지 (가능하면 영상까지) 업로드</h2>
                        </div>
                        <p className="text-sm text-gray-600">
                            뮤직비디오 레퍼런스나 분위기를 담은 이미지도 함께 업로드해보세요.
                        </p>
                        <span className="absolute right-6 bottom-6 text-sm font-semibold text-gray-500 group-hover:text-yellow-700 group-hover:translate-x-1 transition">
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
                    <div className="grid gap-6 rounded-3xl border border-gray-100 bg-gray-50/60 p-6 sm:grid-cols-2">
                        {audioFile && (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">선택된 허밍</p>
                                    <p className="text-base font-semibold text-gray-900">{audioFile.name}</p>
                                    <p className="text-sm text-gray-500">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
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
                                    <p className="text-sm font-medium text-gray-500">선택된 이미지 / 영상</p>
                                    <p className="text-base font-semibold text-gray-900">{imageFile.name}</p>
                                    <p className="text-sm text-gray-500">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                {imageURL && (
                                    <div className="overflow-hidden rounded-2xl border border-gray-200">
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

                {status && <p className="text-sm font-medium text-yellow-700">{status}</p>}
            </div>
        </section>
    );
}
