import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "./button";

type InputProps = {
    placeholder?: string;
    postUrl?: string; // 무드 페이지에서만 필요
    nextPath: string;
    type?: "style" | "mood"; // 페이지 종류 구분
};

function InputText({ placeholder, postUrl, nextPath, type }: InputProps) {
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (value.trim() === "" || loading) return;

        // 페이지2: 스타일 입력 — 저장만
        if (type === "style") {
            sessionStorage.setItem("style", value.trim());
            navigate(nextPath);
            return;
        }

        // 페이지3: 무드 입력 — 스타일+무드 합쳐서 전송
        if (type === "mood" && postUrl) {
            setLoading(true);
            const style = sessionStorage.getItem("style");
            const hummingPath =
                sessionStorage.getItem("hummingPath") || "storage/hm_1234.webm";

            const body = {
                hummingPath,
                mood: value.trim(),
                style,
            };

            try {
                const response = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    throw new Error(`서버 오류 (${response.status})`);
                }

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
        < form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-10" >
            <input
                type="text"
                value={value}
                placeholder={placeholder ?? "입력하세요"}
                onChange={(e) => setValue(e.target.value)}
                className=""
            />
            <Button toWhere="#" onClick={handleSubmit}>
                {loading ? "로딩 중" : "제출하기"}
            </Button>
        </form >
    );
}

export default InputText;
