import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "./button";

type InputProps = {
    placeholder?: string;
    postUrl: string;
    nextPath: string;
}

function InputText({ placeholder, postUrl, nextPath }: InputProps) {
    const [value, setValue] = useState(""); //사용자가 입력한 텍스트
    const [loading, setLoading] = useState(false);
    const toWhere = useNavigate();

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault(); //form의 기본 새로고침 방지
        if (value.trim() == "" || loading) return;

        try {
            setLoading(true);
            const response = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: value.trim() })
            });

            //전송했는데 오류날때
            if (!response.ok) {
                throw new Error(`😱서버 오류`);
            }

            //성공
            console.log("🐳서버 전송 완료:", value);
            setValue("");
            toWhere(nextPath);

        } catch (err) {
            //전송 자체를 못했을때
            console.error("❌ 전송 실패:", err);
            alert("서버 전송에 실패했습니다. 다시 시도해주세요.");

        } finally {
            //성공하던 실패하던 로딩 상태는 해제
            setLoading(false);
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input type="text"
                    value={value}
                    placeholder={placeholder ?? "입력하세요"}
                    onChange={(e) => setValue(e.target.value)} />
                <Button toWhere="#" onClick={handleSubmit}>
                    {loading ? "로딩 중" : "제출 완료"}
                </Button>
            </form>

        </>
    );
}

export default InputText;