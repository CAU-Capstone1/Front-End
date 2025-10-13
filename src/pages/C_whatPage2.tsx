// import Button from "../components/button";
import InputText from "../components/textInput";

function What2() {
    return (
        <>
            <InputText
                placeholder="무드를 입력하세요 (예: calm, happy)"
                postUrl="/api/compose"  // 최종 전송 -> ai 연결 한번만 
                nextPath="/musicResult"
                type="mood"
            />
            {/* <Button toWhere="/musicResult">다음으로</Button> */}
        </>
    );
}

export default What2;

