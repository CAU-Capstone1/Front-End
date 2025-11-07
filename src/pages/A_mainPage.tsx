import AudioFileUploader from "../components/audioFile";
import Button from "../components/button";

function MainPage() {
    return (
        <div className="relative min-h-screen w-full overflow-x-hidden px-4 py-12 sm:px-10">
            <div className="pointer-events-none absolute -left-10 top-10 hidden h-32 w-32 rounded-full bg-[var(--accent-rose)]/40 blur-3xl sm:block" />
            <div className="pointer-events-none absolute -right-6 top-40 hidden h-44 w-44 rounded-full bg-[var(--accent-mint)]/50 blur-3xl sm:block" />

            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-14">
                <AudioFileUploader />

                <div className="flex flex-col items-center gap-6 text-center">
                    <p className="text-base text-[var(--text-muted)]">
                        업로드 없이 바로 진행하고 싶다면 아래 버튼을 눌러주세요.
                    </p>
                    <Button toWhere="/what1" className="px-12 py-4 text-lg">
                        나만의 음악 만들기 시작하기
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default MainPage;