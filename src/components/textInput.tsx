import { useState } from "react";
import { useNavigate } from "react-router";

type InputProps = {
    placeholder?: string;
    postUrl: string;
    nextPath: string;
}

function InputText({ placeholder, postUrl, nextPath }: InputProps) {

    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const toWhere = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); //페이지 새로고침 방지
        if (value.trim() == "" || loading) return;

        try {
            setLoading(true);
            const response = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: value })
            });

            if (!response.ok) {
                throw new Error(`😱서버 오류`);
            }
            console.log("🐳서버 전송 완료:", value);
            setValue("");
            if (nextPath) toWhere(nextPath);

        } catch (err) {
            console.error("❌ 전송 실패:", err);
            alert("서버 전송에 실패했습니다. 다시 시도해주세요.");

        } finally {
            setLoading(false);
        }
    }
}



return ( 

     );
}

export default InputText;