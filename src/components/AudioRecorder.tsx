import React, { useState, useRef } from "react";
import { uploadAudio } from "../api/uploadAudio";

const AudioRecorder: React.FC = () => {
    const [recording, setRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
            const blob = new Blob(chunksRef.current, { type: "audio/webm" });
            setAudioURL(URL.createObjectURL(blob));

            // 업로드
            try {
                const res = await uploadAudio(blob);
                console.log("업로드 성공:", res);
                alert("업로드 성공!");
            } catch (err) {
                console.error(err);
                alert("업로드 실패");
            }
        };

        recorder.start();
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    };

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            {recording ? (
                <button onClick={stopRecording}>⏹️ 녹음 중지</button>
            ) : (
                <button onClick={startRecording}>▶️ 녹음 시작</button>
            )}
            {audioURL && (
                <div style={{ marginTop: "10px" }}>
                    <audio src={audioURL} controls />
                </div>
            )}
        </div>
    );
};

export default AudioRecorder;
