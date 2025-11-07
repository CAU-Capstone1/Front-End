import AudioFileUploader from "../components/audioFile";
import Button from "../components/button";

function MainPage() {
    return (
        <div className="min-h-screen w-full bg-[#FBFBFA] px-4 py-10 sm:px-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
                <AudioFileUploader />

                <div className="flex flex-col items-center gap-6 text-center">
                    <p className="text-base text-gray-500">
                        업로드 없이 바로 진행하고 싶다면 아래 버튼을 눌러주세요.
                    </p>
                    <Button toWhere="/what1" className="px-10 py-4 text-lg">
                        나만의 음악 만들기 시작하기
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default MainPage;