import Button from "../components/button";
import InputText from "../components/textInput";

function What1() {
    return (
        <>
            <InputText
                placeholder="스타일을 입력하세요 (예: orchestra, pop)"
                nextPath="/what2" // 다음 페이지로 이동만
                type="style"
            />
            <Button toWhere="/what3">다음으로</Button>
        </>
    );
}

export default What1;
