import Button from "../components/button";

function MainPage() {
    return (
        <>
            <div>
                어서오세요👽 <br /> 지금부터 음악을 만들어볼까요 ?
            </div>
            <Button toWhere='/what1' className="px-5 py-4 ">허밍 올리는 버튼</Button>
        </ >
    );
}

export default MainPage;