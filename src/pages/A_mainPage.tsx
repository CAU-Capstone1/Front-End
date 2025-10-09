import Button from "../components/button";
import AudioFileUploader from "../components/audioFile";

function MainPage() {
    return (
        <div className="flex flex-col items-center justify-center gap-10">
            <AudioFileUploader />
            <div >
                어서오세요<br />지금부터 음악을 만들어볼까요 ?
            </div >
            <Button toWhere='/what1'>허밍 올리는 버튼</Button>
        </div>
    );
}

export default MainPage;