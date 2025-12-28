import { useNavigate, useSearchParams } from "react-router";
import VisualUploader from "../components/visualUploader";
import Button from "../components/button";
import { getAnswer } from "../utils/compositionSession";
function VisualUploadPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEditMode = searchParams.get("from") === "review";
    const handleNext = () => {
        const mainMelody = getAnswer("hummingMain");
        if (!mainMelody && !isEditMode) {
            alert("메인 멜로디 허밍을 먼저 업로드해주세요.");
            navigate("/");
            return;
        }
        navigate(isEditMode ? "/review" : "/what1");
    };
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-16 sm:px-10">
            <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-[var(--accent-rose)]/25 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-32 h-56 w-56 rounded-full bg-[var(--accent-amber)]/30 blur-3xl" />
            <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-12 text-center">
                {}
                <div className="w-full">
                    <VisualUploader />
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button onClick={handleNext} variant="rainbow" className="px-24 py-5 text-lg">
                        {isEditMode ? "완료" : "다음"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
export default VisualUploadPage;
