import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Button from "./button";

type InputProps = {
    placeholder?: string;
    postUrl?: string;           // 무드 페이지에서만 필요
    nextPath: string;
    type?: "style" | "mood";    // 페이지 종류 구분
};

function InputText({ placeholder, postUrl, nextPath, type }: InputProps) {
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const taRef = useRef<HTMLTextAreaElement>(null);

    // 내용에 맞게 textarea 자동 리사이즈
    const autoResize = (el: HTMLTextAreaElement) => {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    };

    useEffect(() => {
        if (taRef.current) autoResize(taRef.current);
    }, [value]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (value.trim() === "" || loading) return;

        if (type === "style") {
            // 페이지2: 스타일 입력 — 저장만
            sessionStorage.setItem("style", value.trim());
            navigate(nextPath);
            return;
        }

        if (type === "mood" && postUrl) {
            // 페이지3: 무드 입력 — 스타일+무드 합쳐서 전송
            try {
                setLoading(true);

                const style = sessionStorage.getItem("style");
                const hummingPath =
                    sessionStorage.getItem("hummingPath") || "storage/hm_1234.webm";

                const body = { hummingPath, mood: value.trim(), style };

                const response = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });

                if (!response.ok) throw new Error(`서버 오류 (${response.status})`);

                console.log("🐳 서버 전송 완료:", body);
                navigate(nextPath);
            } catch (err) {
                console.error("❌ 전송 실패:", err);
                alert("서버 전송에 실패했습니다. 다시 시도해주세요.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-7xl mx-auto flex flex-col items-center gap-6"
        >
            <textarea
                ref={taRef}
                rows={1} // 시작 높이(한 줄). 내용에 따라 자동 확장
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onInput={(e) => autoResize(e.currentTarget)}
                placeholder={placeholder ?? "입력하세요"}
                className="
          block w-full min-h-14
          rounded-xl border border-gray-300 bg-white
          px-6 py-3 text-lg text-left leading-relaxed
          placeholder:text-gray-400
          shadow-sm transition
          hover:border-gray-400
          focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200
          disabled:opacity-60 disabled:cursor-not-allowed
          dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700
          dark:placeholder:text-gray-500 dark:focus:border-yellow-400 dark:focus:ring-yellow-800/50
          resize-none overflow-hidden whitespace-pre-wrap
        "
            />

            <Button toWhere="#" type="submit">
                {loading ? "로딩 중" : "제출하기"}
            </Button>
        </form>
    );
}

export default InputText;
