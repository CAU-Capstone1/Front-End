// src/components/AudioFileUploader.tsx
import React, { useCallback, useRef, useState } from "react";
import { uploadAudio } from "../api/uploadAudio";

const MAX_SIZE_MB = 50;

export default function AudioFileUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("");
    const inputRef = useRef<HTMLInputElement | null>(null);

    const onPick = () => inputRef.current?.click();

    const onFiles = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return;
        const f = files[0];

        // 간단한 검증
        if (!f.type.startsWith("audio/")) {
            alert("오디오 파일만 업로드할 수 있어요.");
            return;
        }
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`파일이 너무 큽니다. ${MAX_SIZE_MB}MB 이하만 업로드 가능해요.`);
            return;
        }

        setFile(f);
        setAudioURL(URL.createObjectURL(f));
        setStatus("");
    }, []);

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        onFiles(e.dataTransfer.files);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFiles(e.target.files);
    };

    const onUpload = async () => {
        if (!file) return;
        setStatus("업로드 중...");
        try {
            const res = await uploadAudio(file, file.name);
            setStatus(`업로드 성공 ✅ (status=${res.status})`);
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : String(err);
            setStatus(`업로드 실패 ❌: ${message}`);
        }
    };

    return (
        <div className="grid gap-4 max-w-lg mx-auto">
            {/* 드래그&드롭 영역 */}
            <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer"
                onClick={onPick}
            >
                <p className="font-medium">오디오 파일을 여기에 드래그하거나 클릭해서 선택</p>
                <p className="text-sm opacity-60 mt-1">지원: audio/* · 최대 {MAX_SIZE_MB}MB</p>
            </div>

            {/* 숨겨진 파일 인풋 */}
            <input
                ref={inputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={onChange}
            />

            {file && (
                <div className="rounded-xl border p-4">
                    <div className="font-medium">선택된 파일: {file.name}</div>
                    <div className="text-sm opacity-60">({(file.size / 1024 / 1024).toFixed(2)} MB)</div>
                    {audioURL && (
                        <audio src={audioURL} controls className="mt-3 w-full" />
                    )}
                    <button
                        onClick={onUpload}
                        className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white"
                    >
                        업로드
                    </button>
                </div>
            )}

            {status && <div className="text-center">{status}</div>}
        </div>
    );
}
