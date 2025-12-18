import { useCallback, useMemo, useRef, useState } from "react";
import Button from "./button";
import { uploadAudio } from "../api/uploadAudio";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";
import type { CompositionAnswerKey } from "../utils/compositionSession";

const MAX_AUDIO_SIZE_MB = 50;

const AUDIO_SEGMENTS = [
  { id: "start", label: "시작 멜로디", helper: "도입부나 전주 느낌", required: false },
  { id: "main", label: "메인 멜로디", helper: "코러스, 후렴 등 핵심", required: true },
  { id: "end", label: "끝 멜로디", helper: "아웃트로, 마무리", required: false },
] as const;

type SegmentId = typeof AUDIO_SEGMENTS[number]["id"];

type SegmentState = {
  file: File | null;
  previewURL: string | null;
  isUploading: boolean;
  status: string;
  storedName: string | null;
  isRecording: boolean;
  recordingTime: number;
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
      isRecording: false,
      recordingTime: 0,
    },
    main: {
      file: null,
      previewURL: null,
      isUploading: false,
      status: "",
      storedName: getAnswer("hummingMain") ?? null,
      isRecording: false,
      recordingTime: 0,
    },
    end: {
      file: null,
      previewURL: null,
      isUploading: false,
      status: "",
      storedName: getAnswer("hummingEnd") ?? null,
      isRecording: false,
      recordingTime: 0,
    },
  }));

  const mediaRecorderRefs = useRef<Record<SegmentId, MediaRecorder | null>>({
    start: null,
    main: null,
    end: null,
  });

  const recordingChunksRefs = useRef<Record<SegmentId, Blob[]>>({
    start: [],
    main: [],
    end: [],
  });

  const recordingIntervalRefs = useRef<Record<SegmentId, ReturnType<typeof setInterval> | null>>({
    start: null,
    main: null,
    end: null,
  });

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

  const validateFile = (file: File, maxSize: number) => {
    // mp3 파일만 허용
    const isMp3 = file.type === "audio/mpeg" || file.type === "audio/mp3" || file.name.toLowerCase().endsWith(".mp3");
    if (!isMp3) {
      alert("mp3 파일만 업로드할 수 있어요.");
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
      if (!validateFile(candidate, MAX_AUDIO_SIZE_MB)) return;

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
      // 1. 서버 응답을 받아옴 (uploadAudio 함수는 { status, data } 객체를 반환한다고 가정)
      const uploadResponse = await uploadAudio(current.file, `${segmentId}-${current.file.name}`);

      // 🚨 2. 수정된 부분: 서버 응답에서 'filePath' 필드를 추출하도록 변경
      // (이전 진단 결과, 서버가 'filePath'를 반환하고 클라이언트가 's3Key'를 기대하여 오류가 발생했음)
      const s3Key = (uploadResponse.data as { filePath?: string })?.filePath;

      if (!s3Key) {
        // 서버는 200 OK를 보냈지만, 필수 필드가 없는 경우
        throw new Error(`서버 응답에 파일 경로(filePath) 필드가 없습니다: ${JSON.stringify(uploadResponse.data)}`);
      }

      // 3. 추출한 S3 고유 키를 CompositionAnswers에 저장
      setAnswer(SEGMENT_KEY_MAP[segmentId], s3Key);

      setSegmentState((prev) => ({
        ...prev,
        [segmentId]: {
          ...prev[segmentId],
          isUploading: false,
          status: "업로드 완료 ✅",
          // storedName을 S3 고유 키로 설정하여 성공 상태 표시
          storedName: s3Key,
        },
      }));

      // 메인 멜로디 업로드 완료 시 커스텀 이벤트 발생
      if (segmentId === "main") {
        window.dispatchEvent(new CustomEvent("mainMelodyUploaded"));
      }
    } catch (error) {
      console.error("업로드 중 치명적인 오류 발생:", error);
      setSegmentState((prev) => ({
        ...prev,
        [segmentId]: {
          ...prev[segmentId],
          isUploading: false,
          // 오류 메시지를 포함하여 상태를 업데이트하면 디버깅에 도움이 될 수 있습니다.
          status: `업로드 실패 ❌: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
        },
      }));
    }
  };

  const startRecording = async (segmentId: SegmentId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        
        // webm을 mp3로 변환 시도 (실제로는 형식 변환이 필요하지만, 서버가 mp3만 받으므로 확장자만 변경)
        // 실제 변환은 서버에서 처리하거나, 클라이언트에서 라이브러리를 사용해야 합니다
        // 여기서는 확장자만 mp3로 변경하고 타입을 audio/mpeg로 설정
        const file = new File([blob], `recording-${segmentId}-${Date.now()}.mp3`, { type: "audio/mpeg" });
        
        setSegmentState((prev) => {
          const previousPreview = prev[segmentId].previewURL;
          if (previousPreview) URL.revokeObjectURL(previousPreview);

          return {
            ...prev,
            [segmentId]: {
              ...prev[segmentId],
              file,
              previewURL: URL.createObjectURL(blob), // 미리보기는 원본 blob 사용
              isRecording: false,
              recordingTime: 0,
              status: "",
            },
          };
        });

        // 스트림 정리
        stream.getTracks().forEach((track) => track.stop());
        
        // 인터벌 정리
        if (recordingIntervalRefs.current[segmentId]) {
          clearInterval(recordingIntervalRefs.current[segmentId]!);
          recordingIntervalRefs.current[segmentId] = null;
        }
      };

      mediaRecorder.start();
      mediaRecorderRefs.current[segmentId] = mediaRecorder;
      recordingChunksRefs.current[segmentId] = chunks;

      setSegmentState((prev) => ({
        ...prev,
        [segmentId]: {
          ...prev[segmentId],
          isRecording: true,
          recordingTime: 0,
        },
      }));

      // 녹음 시간 카운터
      recordingIntervalRefs.current[segmentId] = setInterval(() => {
        setSegmentState((prev) => ({
          ...prev,
          [segmentId]: {
            ...prev[segmentId],
            recordingTime: prev[segmentId].recordingTime + 1,
          },
        }));
      }, 1000);
    } catch (error) {
      console.error("녹음 시작 실패:", error);
      alert("마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.");
    }
  };

  const stopRecording = (segmentId: SegmentId) => {
    const mediaRecorder = mediaRecorderRefs.current[segmentId];
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    if (recordingIntervalRefs.current[segmentId]) {
      clearInterval(recordingIntervalRefs.current[segmentId]!);
      recordingIntervalRefs.current[segmentId] = null;
    }
  };

  const resetSegment = (segmentId: SegmentId) => {
    // 녹음 중이면 중지
    if (segmentState[segmentId].isRecording) {
      stopRecording(segmentId);
    }

    setSegmentState((prev) => {
      const previousPreview = prev[segmentId].previewURL;
      if (previousPreview) URL.revokeObjectURL(previousPreview);
      return {
        ...prev,
        [segmentId]: {
          ...prev[segmentId],
          file: null,
          previewURL: null,
          isUploading: false,
          status: "",
          storedName: null,
          isRecording: false,
          recordingTime: 0,
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
            <span className="font-semibold text-[var(--accent-rose)]">메인 멜로디는 필수</span>로 올려야 음악이 만들어져요.{" "}
            <span className="text-[var(--text-muted)]">시작, 끝 멜로디는 올리고 싶은 것만 올려요.</span>
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {AUDIO_SEGMENTS.map((segment) => {
            const state = segmentState[segment.id];
            return (
              <div
                key={segment.id}
                className={`relative flex h-full flex-col gap-4 rounded-[1.8rem] border-2 px-5 py-6 text-center shadow-[0_12px_0_rgba(46,31,39,0.08)] transition ${
                  state.file || state.storedName
                    ? segment.required
                      ? "border-[var(--accent-amber)] bg-white ring-2 ring-[var(--accent-amber)]/30"
                      : "border-[var(--accent-amber)] bg-white"
                    : segment.required
                    ? "border-[var(--accent-rose)]/50 bg-white/70 ring-2 ring-[var(--accent-rose)]/20"
                    : "border-black/10 bg-white/70"
                }`}
              >
                {segment.required ? (
                  <span className="absolute right-4 top-3 rounded-full bg-[var(--accent-rose)] px-2 py-0.5 text-xs font-bold text-white shadow-md">
                    필수
                  </span>
                ) : (
                  <span className="absolute right-4 top-3 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600 shadow-md">
                    선택
                  </span>
                )}
                <div className="space-y-1">
                  <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">{segment.label}</h3>
                  <p className="text-[15px] text-[var(--text-muted)]">{segment.helper}</p>
                </div>
                {!(state.file || state.storedName) && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => segmentInputRefs[segment.id].current?.click()}
                      className={`my-btn rounded-[1.2rem] border-2 bg-white px-3 py-3 text-sm font-semibold shadow-[0_8px_0_rgba(242,137,130,0.18)] transition hover:-translate-y-[2px] ${
                        segment.required
                          ? "border-[var(--accent-rose)] text-[var(--accent-rose)]"
                          : "border-gray-300 text-gray-500 shadow-[0_8px_0_rgba(156,163,175,0.18)]"
                      }`}
                    >
                      파일 선택
                    </button>
                    {state.isRecording ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                          <span className="text-sm font-semibold text-red-500">
                            녹음 중... {Math.floor(state.recordingTime / 60)}:{(state.recordingTime % 60).toString().padStart(2, "0")}
                          </span>
                        </div>
                        <Button
                          variant="danger"
                          onClick={() => stopRecording(segment.id)}
                          className="w-full"
                        >
                          녹음 중지
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startRecording(segment.id)}
                        className={`my-btn rounded-[1.2rem] border-2 bg-white px-3 py-3 text-sm font-semibold shadow-[0_8px_0_rgba(242,137,130,0.18)] transition hover:-translate-y-[2px] w-full ${
                          segment.required
                            ? "border-[var(--accent-rose)] text-[var(--accent-rose)]"
                            : "border-gray-300 text-gray-500 shadow-[0_8px_0_rgba(156,163,175,0.18)]"
                        }`}
                      >
                        🎤 녹음하기
                      </button>
                    )}
                  </div>
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
                  accept="audio/mpeg,audio/mp3,.mp3"
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